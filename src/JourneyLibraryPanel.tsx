import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bookmark, ChevronDown, ChevronRight, Clock3, X } from 'lucide-react';
import { getParkById } from './data';
import { shortStopName } from './journey';
import { journeyKey } from './journeyLibrary';
import type { JourneyLibrary } from './journeyLibrary';

interface Props {
  library: JourneyLibrary;
  planned: boolean;
  storageUnavailable: boolean;
  onPlan: (from: string, to: string) => void;
  onRemove: (from: string, to: string) => void;
  onClearRecent: () => void;
}

export default function JourneyLibraryPanel({ library, planned, storageUnavailable, onPlan, onRemove, onClearRecent }: Props) {
  const hasJourneys = library.saved.length + library.recent.length > 0;
  const [expanded, setExpanded] = useState(!planned && hasJourneys);
  const savedTitle = useRef<HTMLHeadingElement>(null);
  const recentTitle = useRef<HTMLHeadingElement>(null);
  useEffect(() => { setExpanded(!planned && hasJourneys); }, [planned]);

  function open(from: string, to: string) { setExpanded(false); onPlan(from, to); }

  return <details className="journey-library" open={expanded} onToggle={(event) => setExpanded(event.currentTarget.open)}>
    <summary><Bookmark size={19} /><span>Your journeys<small>{library.saved.length} saved · {library.recent.length} recent</small></span><ChevronDown size={18} /></summary>
    <div className="journey-library-content">
      <p className="journey-library-note">Saved on this device. Journeys reopen with current route information.</p>
      {storageUnavailable && <p className="journey-note" role="status">Browser storage is unavailable. Your journeys will only be kept for this visit.</p>}
      <section aria-labelledby="saved-journeys-title">
        <h3 id="saved-journeys-title" ref={savedTitle} tabIndex={-1}><Bookmark size={17} /> Saved journeys</h3>
        {library.saved.length ? <ul className="journey-library-list">{library.saved.map((trip) => {
          const from = shortStopName(getParkById(trip.from));
          const to = shortStopName(getParkById(trip.to));
          return <li key={journeyKey(trip.from, trip.to)}>
            <button className="journey-library-open" aria-label={`Open saved journey ${from} to ${to}`} onClick={() => open(trip.from, trip.to)}><span>{from}<ArrowRight size={14} />{to}</span><ChevronRight size={17} /></button>
            <button className="journey-library-remove" aria-label={`Remove saved journey ${from} to ${to}`} onClick={(event) => {
              const row = event.currentTarget.closest('li');
              const next = row?.nextElementSibling?.querySelector('button') || row?.previousElementSibling?.querySelector('button') || savedTitle.current;
              onRemove(trip.from, trip.to);
              requestAnimationFrame(() => next?.focus({ preventScroll: true }));
            }}><X size={18} /></button>
          </li>;
        })}</ul> : <p className="journey-library-empty">Choose “Save journey” in your results to keep a trip here.</p>}
      </section>
      <section aria-labelledby="recent-journeys-title">
        <div className="journey-library-heading"><h3 id="recent-journeys-title" ref={recentTitle} tabIndex={-1}><Clock3 size={17} /> Recent searches</h3>{library.recent.length > 0 && <button className="journey-library-clear" onClick={() => { onClearRecent(); requestAnimationFrame(() => recentTitle.current?.focus({ preventScroll: true })); }}>Clear recent searches</button>}</div>
        {library.recent.length ? <ul className="journey-library-list">{library.recent.map((trip) => {
          const from = shortStopName(getParkById(trip.from));
          const to = shortStopName(getParkById(trip.to));
          return <li key={journeyKey(trip.from, trip.to)}><button className="journey-library-open" aria-label={`Open recent journey ${from} to ${to}`} onClick={() => open(trip.from, trip.to)}><span>{from}<ArrowRight size={14} />{to}</span><ChevronRight size={17} /></button></li>;
        })}</ul> : <p className="journey-library-empty">Your last five successful searches will appear here.</p>}
      </section>
    </div>
  </details>;
}
