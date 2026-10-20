import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import Modal from './Modal';
import { carParks } from './data';
import { downloadText } from './journey';
import { saveReport } from './reports';
import type { CorrectionReport } from './reports';

export default function ReportDialog({ from, to, onClose, onSaved }: {
  from: string; to: string; onClose: () => void; onSaved: () => void;
}) {
  const [saved, setSaved] = useState<CorrectionReport | null>(null);
  const [error, setError] = useState('');
  const observations = useRef<HTMLDetailsElement>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) || '').trim();
    if (value('from') === value('to')) { setError('Choose two different stops for this report.'); return; }
    if (value('description').length < 10) { setError('Please describe what needs checking in at least 10 characters.'); return; }
    if (value('category') === 'field-observation' && (!value('boarding') || !value('alighting') || value('transport') === 'unknown' || !value('checkedAt') || !value('source') || !value('checkedBy'))) {
      setError('Complete the boarding and alighting landmarks, transport type, date, source, and observer under Field observations.');
      if (observations.current) observations.current.open = true;
      return;
    }
    const report: CorrectionReport = {
      id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'pending-review',
      from: value('from'), to: value('to'), category: value('category') as CorrectionReport['category'], description: value('description'),
      observations: { boardingLandmark: value('boarding'), alightingLandmark: value('alighting'),
        transportMode: value('transport'), checkedAt: value('checkedAt'), source: value('source'), checkedBy: value('checkedBy') },
    };
    // A field observation is evidence for review, never automatic verification.
    try { saveReport(report); setSaved(report); onSaved(); }
    catch { setError('This browser could not save the report. Download a copy instead.'); setSaved(report); }
  }
  return <Modal title={saved ? 'Your report is ready' : 'Help improve this journey'} onClose={onClose}>
    {saved ? <div className="report-success">
      <CheckCircle2 size={36} /><p>{error || 'Saved on this device for review.'}</p>
      <p className="journey-muted">Reports stay in this browser. Download this report and share it with the project maintainer; it has not been sent anywhere.</p>
      <button className="journey-primary" onClick={() => downloadText('routely-report-' + saved.id + '.json', JSON.stringify(saved, null, 2), 'application/json')}><Download size={17} /> Download report</button>
      <button className="journey-secondary" onClick={onClose}>Done</button>
    </div> : <form className="report-form" onSubmit={submit}>
      <p className="journey-muted">Tell us about a boarding point, connection, or map issue. Your report will be saved on this device so you can download it for review.</p>
      <div className="report-pair">
        <label>From<select name="from" defaultValue={from} required><option value="">Choose a stop</option>{carParks.map((park) => <option key={park.id} value={park.id}>{park.name}</option>)}</select></label>
        <label>To<select name="to" defaultValue={to} required><option value="">Choose a stop</option>{carParks.map((park) => <option key={park.id} value={park.id}>{park.name}</option>)}</select></label>
      </div>
      <label>What needs checking?<select name="category" defaultValue="boarding" onChange={(event) => { if (event.target.value === 'field-observation' && observations.current) observations.current.open = true; }}><option value="boarding">Boarding or alighting point</option><option value="connection">Connection or transport type</option><option value="map">Map or stop location</option><option value="field-observation">Record a field observation</option><option value="other">Something else</option></select></label>
      <label>Describe what you found<textarea name="description" required minLength={10} maxLength={2000} rows={4} placeholder="Include a useful landmark and the direction of travel." /></label>
      <details className="observation-fields" ref={observations}><summary>Field observations</summary>
        <label>Exact boarding landmark<input name="boarding" maxLength={200} /></label>
        <label>Exact alighting landmark<input name="alighting" maxLength={200} /></label>
        <div className="report-pair"><label>Transport type<select name="transport" defaultValue="unknown"><option value="unknown">Needs checking</option><option value="shared-taxi">Shared taxi</option><option value="bus">Bus</option><option value="shuttle">Shuttle</option></select></label><label>Date observed<input name="checkedAt" type="date" max={new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date())} /></label></div>
        <label>Source of the observation<input name="source" maxLength={200} placeholder="How was this connection checked?" /></label>
        <label>Observer<input name="checkedBy" maxLength={200} placeholder="Name or project identifier" /></label>
        <p className="journey-muted">Evidence is reviewed before route information is marked as field-checked. Do not include private contact details.</p>
      </details>
      {error && <p className="journey-error" role="alert">{error}</p>}
      <button className="journey-primary" type="submit">Save report on this device</button>
    </form>}
  </Modal>;
}
