import { useCallback, useEffect, useRef, useState } from 'react';
import { emptyJourneyLibrary, JOURNEY_LIBRARY_KEY, journeyKey, parseJourneyLibrary, recordRecentJourney, toggleSavedJourney } from './journeyLibrary';
import type { JourneyLibrary } from './journeyLibrary';

function loadLibrary() {
  try { return { library: parseJourneyLibrary(window.localStorage.getItem(JOURNEY_LIBRARY_KEY)), storageUnavailable: false }; }
  catch { return { library: emptyJourneyLibrary(), storageUnavailable: true }; }
}

export function useJourneyLibrary() {
  const [state, setState] = useState(loadLibrary);
  const current = useRef(state.library);
  const commit = useCallback((next: JourneyLibrary) => {
    let persisted = true;
    try { window.localStorage.setItem(JOURNEY_LIBRARY_KEY, JSON.stringify(next)); }
    catch { persisted = false; }
    current.current = next;
    setState({ library: next, storageUnavailable: !persisted });
    return persisted;
  }, []);

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key !== JOURNEY_LIBRARY_KEY && event.key !== null) return;
      const library = parseJourneyLibrary(event.key === null ? null : event.newValue);
      current.current = library;
      setState({ library, storageUnavailable: false });
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const recordRecent = useCallback((from: string, to: string) => {
    const next = recordRecentJourney(current.current, from, to);
    if (next !== current.current) commit(next);
  }, [commit]);

  const toggleSaved = useCallback((from: string, to: string) => {
    const result = toggleSavedJourney(current.current, from, to);
    const persisted = result.library !== current.current ? commit(result.library) : false;
    return { action: result.action, persisted };
  }, [commit]);

  const removeSaved = useCallback((from: string, to: string) => {
    const saved = current.current.saved.filter((trip) => journeyKey(trip.from, trip.to) !== journeyKey(from, to));
    return commit({ ...current.current, saved });
  }, [commit]);

  const clearRecent = useCallback(() => commit({ ...current.current, recent: [] }), [commit]);

  return { ...state, recordRecent, toggleSaved, removeSaved, clearRecent };
}
