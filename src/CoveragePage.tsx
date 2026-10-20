import { ArrowRight, ClipboardCheck, Download, MapPin } from 'lucide-react';
import { carParks, findRoutePath, getParkById } from './data';
import { downloadText, journeyStatus, PILOT_JOURNEYS, pilotSurveyTemplate, shortStopName } from './journey';
import { readReports } from './reports';

export default function CoveragePage({ onPlan, onReport }: { onPlan: (from: string, to: string) => void; onReport: () => void }) {
  const reports = readReports();
  const checked = PILOT_JOURNEYS.filter(({ from, to }) => journeyStatus(findRoutePath(from, to)).isVerified).length;
  return <main className="coverage-page" id="main-content">
    <div className="coverage-heading"><span className="journey-eyebrow">BUILDING A USEFUL ABUJA GUIDE</span><h1>Small coverage. Clear information.</h1><p>Our first milestone is ten journeys with boarding points and connections checked on the ground. The current network is sample data.</p></div>
    <div className="coverage-stats"><div><strong>{checked} / {PILOT_JOURNEYS.length}</strong><span>Pilot journeys field-checked</span></div><div><strong>{carParks.length}</strong><span>Sample stop locations</span></div><div><strong>{reports.length}</strong><span>Reports saved on this device</span></div></div>
    <div className="coverage-notice"><ClipboardCheck size={22} /><div><strong>What “field-checked” means</strong><p>Each direction needs a confirmed boarding landmark, alighting point, transport type, source, observer, and date. A submitted report stays pending until reviewed. A checked connection does not imply live service.</p></div></div>
    <section aria-labelledby="pilot-title"><div className="coverage-section-heading"><div><h2 id="pilot-title">The first ten journeys</h2><p>These are collection targets. Select one to preview the sample journey.</p></div><button className="journey-secondary" onClick={() => downloadText('routely-pilot-survey.json', JSON.stringify(pilotSurveyTemplate(), null, 2), 'application/json')}><Download size={16} /> Survey template</button></div>
      <div className="pilot-grid">{PILOT_JOURNEYS.map(({ from, to }, index) => {
        const status = journeyStatus(findRoutePath(from, to));
        return <button className="pilot-card" key={from + to} onClick={() => onPlan(from, to)}><span className="pilot-number">{String(index + 1).padStart(2, '0')}</span><span className="pilot-card-copy"><strong>{shortStopName(getParkById(from))}<ArrowRight size={14} />{shortStopName(getParkById(to))}</strong><span className={status.isVerified ? 'status-verified' : 'status-sample'}>{status.isVerified ? 'Field-checked' : 'Needs field checking'}</span></span><ArrowRight size={18} /></button>;
      })}</div>
    </section>
    <div className="coverage-bottom"><section className="coverage-info-card"><MapPin size={24} /><h2>What the map can tell you</h2><p>Stop pins are sample locations. Dashed lines show connections between stops, not the streets a vehicle follows. Recorded paths appear as solid lines when available.</p><p>Fares, operating hours, journey times, and live service are not available.</p></section><section className="coverage-info-card"><ClipboardCheck size={24} /><h2>Help check a journey</h2><p>Record the direction, exact boarding and alighting landmarks, transport type, and the date and source of your observation.</p><button className="journey-primary" onClick={onReport}>Record an observation</button></section></div>
    <section className="coverage-reports"><div className="coverage-section-heading"><div><h2>Reports on this device</h2><p>Reports are stored in this browser. Download them to share with the maintainer.</p></div>{reports.length > 0 && <button className="journey-secondary" onClick={() => downloadText('routely-reports.json', JSON.stringify(reports, null, 2), 'application/json')}><Download size={16} /> Download all reports</button>}</div>{reports.length ? <ul>{reports.map((report) => <li key={report.id}><strong>{shortStopName(getParkById(report.from))} → {shortStopName(getParkById(report.to))}</strong><span>Pending review · {new Date(report.createdAt).toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos' })}</span><p>{report.description}</p></li>)}</ul> : <p className="coverage-empty">No reports saved yet. Observations help turn this prototype into a dependable guide.</p>}</section>
  </main>;
}
