export const REPORTS_KEY = 'routely-reports-v1';

export interface CorrectionReport {
  id: string;
  createdAt: string;
  status: 'pending-review';
  from: string;
  to: string;
  category: 'boarding' | 'connection' | 'map' | 'field-observation' | 'other';
  description: string;
  delivery?: { status: 'submitted'; receiptId: string; submittedAt: string };
  observations?: {
    boardingLandmark: string;
    alightingLandmark: string;
    transportMode: string;
    checkedAt: string;
    source: string;
    checkedBy: string;
  };
}

export function parseReports(raw: string | null): CorrectionReport[] {
  try {
    const parsed: unknown = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((report): report is CorrectionReport => Boolean(report && typeof report === 'object' &&
      typeof report.id === 'string' && typeof report.createdAt === 'string' && report.status === 'pending-review' &&
      typeof report.from === 'string' && typeof report.to === 'string' && typeof report.description === 'string' &&
      ['boarding', 'connection', 'map', 'field-observation', 'other'].includes(report.category))).map((report) => {
        const delivery = report.delivery;
        if (delivery?.status === 'submitted' && delivery.receiptId === report.id &&
            typeof delivery.submittedAt === 'string' && Number.isFinite(Date.parse(delivery.submittedAt))) return report;
        const { delivery: ignored, ...draft } = report;
        return draft;
      });
  } catch { return []; }
}

export function readReports(): CorrectionReport[] {
  try { return parseReports(localStorage.getItem(REPORTS_KEY)); } catch { return []; }
}

export function saveReport(report: CorrectionReport) {
  const reports = readReports();
  const updated = [report, ...reports.filter((existing) => existing.id !== report.id)];
  localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  return updated;
}
