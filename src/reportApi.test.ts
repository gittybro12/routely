import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendReport } from './reportApi';
import { parseReports, readReports, saveReport } from './reports';
import type { CorrectionReport } from './reports';

const report: CorrectionReport = { id: '7176efda-f688-4b4f-a8bb-3de1aac7775c', createdAt: '2026-10-22T10:00:00Z',
  status: 'pending-review', from: 'wuse2', to: 'jabi', category: 'boarding', description: 'Check the boarding point near this stop.' };
const receivedAt = '2026-10-22T10:01:00Z';
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => store.get(key) || null, setItem: (key: string, value: string) => store.set(key, value) });
});
afterEach(() => vi.unstubAllGlobals());

describe('report delivery', () => {
  it('uses CSRF, sends only public submission fields, and stores a confirmed receipt without duplicating the draft', async () => {
    saveReport(report);
    const fetcher = vi.fn().mockResolvedValueOnce(json({ csrfToken: 'test-token' }))
      .mockResolvedValueOnce(json({ id: report.id, status: 'received', receivedAt }, 201));
    vi.stubGlobal('fetch', fetcher);
    const result = await sendReport(report);
    const options = fetcher.mock.calls[1][1];
    expect(options.headers['X-CSRFToken']).toBe('test-token');
    expect(options.credentials).toBe('same-origin');
    expect(JSON.parse(options.body)).toEqual({ id: report.id, from: 'wuse2', to: 'jabi', category: 'boarding', description: report.description, observations: {} });
    expect(result.keptOnDevice).toBe(true);
    expect(readReports()).toHaveLength(1);
    expect(readReports()[0].delivery).toEqual({ status: 'submitted', receiptId: report.id, submittedAt: receivedAt });
  });

  it('preserves a local draft when offline without claiming delivery', async () => {
    saveReport(report);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Offline')));
    await expect(sendReport(report)).rejects.toThrow('could not be reached');
    expect(readReports()[0].delivery).toBeUndefined();
  });

  it('keeps backend validation messages actionable and rejects an unrelated receipt', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(json({ csrfToken: 'token' }))
      .mockResolvedValueOnce(json({ error: 'Check details', fields: { checked_at: [{ message: 'Date cannot be in the future.' }] } }, 400)));
    await expect(sendReport(report)).rejects.toThrow('Date cannot be in the future.');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(json({ csrfToken: 'token' }))
      .mockResolvedValueOnce(json({ id: 'another-id', status: 'received', receivedAt })));
    await expect(sendReport(report)).rejects.toThrow('Delivery could not be confirmed');
    expect(readReports()).toEqual([]);
  });

  it('confirms server delivery even when the browser cannot retain the receipt', async () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => { throw new Error('Storage blocked'); } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(json({ csrfToken: 'token' }))
      .mockResolvedValueOnce(json({ id: report.id, status: 'received', receivedAt })));
    const result = await sendReport(report);
    expect(result.keptOnDevice).toBe(false);
    expect(result.report.delivery?.status).toBe('submitted');
  });

  it('keeps legacy drafts and strips malformed local delivery metadata', () => {
    expect(parseReports(JSON.stringify([report]))).toEqual([report]);
    expect(parseReports(JSON.stringify([{ ...report, delivery: { status: 'submitted', receiptId: 'wrong-id', submittedAt: receivedAt } }]))).toEqual([report]);
    const confirmed = { ...report, delivery: { status: 'submitted', receiptId: report.id, submittedAt: receivedAt } };
    expect(parseReports(JSON.stringify([confirmed]))).toEqual([confirmed]);
  });
});
