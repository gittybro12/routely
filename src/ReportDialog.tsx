import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Clock3, Download, Send } from 'lucide-react';
import Modal from './Modal';
import { carParks } from './data';
import { downloadText } from './journey';
import { saveReport } from './reports';
import { sendReport } from './reportApi';
import type { CorrectionReport } from './reports';

export default function ReportDialog({ from, to, onClose, onSaved }: {
  from: string; to: string; onClose: () => void; onSaved: () => void;
}) {
  const [saved, setSaved] = useState<CorrectionReport | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [keptOnDevice, setKeptOnDevice] = useState(true);
  const inFlight = useRef(false);
  const observations = useRef<HTMLDetailsElement>(null);

  async function deliver(report: CorrectionReport) {
    if (inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true); setError('');
    try { saveReport(report); setKeptOnDevice(true); }
    catch { setKeptOnDevice(false); }
    try {
      const result = await sendReport(report);
      setSaved(result.report); setKeptOnDevice(result.keptOnDevice);
    } catch (failure) {
      setSaved(report);
      setError(failure instanceof Error ? failure.message : 'Your report could not be submitted. Please try again.');
    } finally { inFlight.current = false; setSubmitting(false); onSaved(); }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) || '').trim();
    if (value('from') === value('to')) { setError('Choose two different stops for this report.'); return; }
    if (value('description').length < 10) { setError('Please describe what needs checking in at least 10 characters.'); return; }
    if (value('category') === 'field-observation' && (!value('boarding') || !value('alighting') || value('transport') === 'unknown' || !value('checkedAt') || !value('source') || !value('checkedBy'))) {
      setError('Complete the boarding and alighting landmarks, transport type, date, source, and observer under Field observations.');
      if (observations.current) observations.current.open = true;
      return;
    }
    void deliver({
      id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'pending-review',
      from: value('from'), to: value('to'), category: value('category') as CorrectionReport['category'], description: value('description'),
      observations: { boardingLandmark: value('boarding'), alightingLandmark: value('alighting'),
        transportMode: value('transport'), checkedAt: value('checkedAt'), source: value('source'), checkedBy: value('checkedBy') },
    });
  }

  const submitted = saved?.delivery?.status === 'submitted';
  return <Modal title={submitted ? 'Report submitted' : saved ? 'Keep a copy of your report' : 'Help improve this journey'} onClose={onClose}>
    {saved ? <div className="report-success" aria-busy={submitting}>
      {submitted ? <CheckCircle2 size={36} /> : <Clock3 size={36} />}
      <p>{submitted ? 'The team received your report for staff review.' : keptOnDevice ? 'Saved on this device. It has not been submitted.' : 'Your report has not been submitted. Download a copy to keep it.'}</p>
      {error && <p className="journey-error" role="alert">{error}</p>}
      <p className="journey-muted">{submitted ? 'A submitted report does not automatically change or verify a route.' : 'You can retry now or send the saved report later from Coverage & data.'}</p>
      {submitted && !keptOnDevice && <p className="journey-muted">This browser could not keep your receipt. Download a copy below.</p>}
      {!submitted && <button className="journey-primary" disabled={submitting} onClick={() => void deliver(saved)}><Send size={17} />{submitting ? 'Sending report…' : 'Try sending again'}</button>}
      <button className="journey-secondary" onClick={() => downloadText('routely-report-' + saved.id + '.json', JSON.stringify(saved, null, 2), 'application/json')}><Download size={17} /> Download report</button>
      <button className="journey-secondary" onClick={onClose}>Done</button>
    </div> : <form className="report-form" onSubmit={submit} aria-busy={submitting}>
      <p className="journey-muted">Send a boarding point, connection, or map issue to the team for review. A copy will stay on this device when browser storage is available.</p>
      <fieldset className="report-fields" disabled={submitting}>
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
        <button className="journey-primary" type="submit"><Send size={17} />{submitting ? 'Sending report…' : 'Send report for review'}</button>
      </fieldset>
    </form>}
  </Modal>;
}
