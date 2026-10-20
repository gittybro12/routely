import { findRoutePath, getParkById } from './data';

export const JOURNEY_LIBRARY_KEY = 'routely-journeys-v1';
export const MAX_SAVED_JOURNEYS = 20;
export const MAX_RECENT_JOURNEYS = 5;

export interface StoredJourney {
  from: string;
  to: string;
  recordedAt: string;
}

export interface JourneyLibrary {
  version: 1;
  saved: StoredJourney[];
  recent: StoredJourney[];
}

export function emptyJourneyLibrary(): JourneyLibrary {
  return { version: 1, saved: [], recent: [] };
}

export function journeyKey(from: string, to: string) {
  return JSON.stringify([from, to]);
}

function validJourney(value: unknown): value is StoredJourney {
  if (!value || typeof value !== 'object') return false;
  const trip = value as Partial<StoredJourney>;
  return typeof trip.from === 'string' && typeof trip.to === 'string' && trip.from !== trip.to &&
    Boolean(getParkById(trip.from) && getParkById(trip.to)) && typeof trip.recordedAt === 'string' &&
    Number.isFinite(Date.parse(trip.recordedAt));
}

function cleanJourneys(value: unknown, limit: number): StoredJourney[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.filter(validJourney).sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt))
    .filter((trip) => {
      const key = journeyKey(trip.from, trip.to);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, limit).map(({ from, to, recordedAt }) => ({ from, to, recordedAt }));
}

export function parseJourneyLibrary(raw: string | null): JourneyLibrary {
  try {
    const parsed: unknown = JSON.parse(raw || 'null');
    if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || parsed.version !== 1) return emptyJourneyLibrary();
    const value = parsed as Partial<JourneyLibrary>;
    return { version: 1, saved: cleanJourneys(value.saved, MAX_SAVED_JOURNEYS), recent: cleanJourneys(value.recent, MAX_RECENT_JOURNEYS) };
  } catch { return emptyJourneyLibrary(); }
}

export function recordRecentJourney(library: JourneyLibrary, from: string, to: string, now = new Date()): JourneyLibrary {
  if (from === to || !findRoutePath(from, to)?.legs.length) return library;
  const trip = { from, to, recordedAt: now.toISOString() };
  return { ...library, recent: [trip, ...library.recent.filter((item) => journeyKey(item.from, item.to) !== journeyKey(from, to))].slice(0, MAX_RECENT_JOURNEYS) };
}

export function toggleSavedJourney(library: JourneyLibrary, from: string, to: string, now = new Date()): {
  library: JourneyLibrary; action: 'saved' | 'removed' | 'limit' | 'invalid';
} {
  const key = journeyKey(from, to);
  if (library.saved.some((trip) => journeyKey(trip.from, trip.to) === key)) {
    return { library: { ...library, saved: library.saved.filter((trip) => journeyKey(trip.from, trip.to) !== key) }, action: 'removed' };
  }
  if (from === to || !findRoutePath(from, to)?.legs.length) return { library, action: 'invalid' };
  if (library.saved.length >= MAX_SAVED_JOURNEYS) return { library, action: 'limit' };
  return { library: { ...library, saved: [{ from, to, recordedAt: now.toISOString() }, ...library.saved] }, action: 'saved' };
}
