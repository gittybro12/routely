import { saveReport } from './reports';
import type { CorrectionReport } from './reports';

async function requestJson(path: string, options?: RequestInit): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await fetch(path, { credentials: 'same-origin', signal: AbortSignal.timeout(12000), ...options });
  } catch {
    throw new Error('The report service could not be reached. Your report has not been confirmed; try sending it again.');
  }
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!payload || typeof payload !== 'object') throw new Error('The report service returned an invalid response. Please retry.');
  if (!response.ok) {
    const details = payload.fields && typeof payload.fields === 'object' ? Object.values(payload.fields).flatMap((errors) =>
      Array.isArray(errors) ? errors.map((item: unknown) => item && typeof item === 'object' && 'message' in item && typeof item.message === 'string' ? item.message : '').filter(Boolean) : []) : [];
    throw new Error(details.slice(0, 3).join(' ') || (typeof payload.error === 'string' ? payload.error : 'The report service is unavailable. Please try again.'));
  }
  return payload;
}

export async function sendReport(report: CorrectionReport): Promise<{ report: CorrectionReport; keptOnDevice: boolean }> {
  const token = await requestJson('/api/v1/csrf/');
  if (typeof token.csrfToken !== 'string' || !token.csrfToken) throw new Error('A submission token could not be obtained. Please try again.');
  const response = await requestJson('/api/v1/reports/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': token.csrfToken },
    body: JSON.stringify({ id: report.id, from: report.from, to: report.to, category: report.category,
      description: report.description, observations: report.observations || {} }),
  });
  if (response.id !== report.id || response.status !== 'received' || typeof response.receivedAt !== 'string' || !Number.isFinite(Date.parse(response.receivedAt))) {
    throw new Error('Delivery could not be confirmed. Try sending this report again; retries use the same report ID.');
  }
  const submitted: CorrectionReport = { ...report, delivery: { status: 'submitted', receiptId: report.id, submittedAt: response.receivedAt } };
  let keptOnDevice = true;
  try { saveReport(submitted); } catch { keptOnDevice = false; }
  return { report: submitted, keptOnDevice };
}
