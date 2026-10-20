import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowDownUp, ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, CheckCircle2, ChevronRight, ClipboardCheck, Download, Flag, Footprints, LocateFixed, Map as MapIcon, MapPin, MessageCircle, Navigation, Route, Share2 } from 'lucide-react';
import AppHeader from './AppHeader';
import LandingPage from './LandingPage';
import CoveragePage from './CoveragePage';
import ReportDialog from './ReportDialog';
import Modal from './Modal';
import StopPicker from './StopPicker';
import JourneyLibraryPanel from './JourneyLibraryPanel';
import { carParks, findRoutePath, getParkById } from './data';
import { downloadText, isConnectionVerified, journeyStatus, journeyText, journeyUrl, nearestStops, PILOT_JOURNEYS, readJourneySelection, routeMapSegments, shortStopName, transportLabel } from './journey';
import { useThemeMode } from './ThemeContext';
import { useViewportSize } from './useViewportSize';
import { useJourneyLibrary } from './useJourneyLibrary';
import { journeyKey, MAX_SAVED_JOURNEYS } from './journeyLibrary';
import './planner.css';

const Map = lazy(() => import('./Map'));
const JourneyAssistant = lazy(() => import('./JourneyAssistant'));

type UserLocation = { latitude: number; longitude: number; accuracy: number };
type LocationStatus = 'off' | 'searching' | 'ready' | 'denied' | 'unavailable';
type Dialog = 'helper' | 'report' | 'share' | null;

function App() {
  const { mode } = useThemeMode();
  useViewportSize();
  const { library, storageUnavailable, recordRecent, toggleSaved, removeSaved, clearRecent } = useJourneyLibrary();
  const initialSelection = useMemo(() => readJourneySelection(window.location.search), []);
  const [page, setPage] = useState(window.location.pathname);
  const [from, setFrom] = useState(initialSelection.from);
  const [to, setTo] = useState(initialSelection.to);
  const [planned, setPlanned] = useState(initialSelection.valid);
  const [invalidLink, setInvalidLink] = useState(initialSelection.invalidLink);
  const [mobileView, setMobileView] = useState<'steps' | 'map'>('steps');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('off');
  const [focusedLocation, setFocusedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [toast, setToast] = useState('');
  const [, setReportVersion] = useState(0);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const locationRequest = useRef(0);
  const appScroll = useRef<HTMLDivElement>(null);
  const helperReturnFocus = useRef<HTMLElement | null>(null);
  const lastRecordedJourney = useRef('');

  const route = useMemo(() => planned ? findRoutePath(from, to) : null, [from, to, planned]);
  const status = journeyStatus(route);
  const segments = useMemo(() => routeMapSegments(route), [route]);
  const hasSchematic = segments.some((segment) => !segment.recorded);
  const nearby = useMemo(() => userLocation ? nearestStops(userLocation).slice(0, 3) : [], [userLocation]);
  const locationOutsideCoverage = Boolean(nearby.length && nearby[0].distanceKm > 30);
  const origin = getParkById(from);
  const destination = getParkById(to);
  const shareUrl = window.location.origin + journeyUrl(from, to);
  const plannerHref = planned && from && to ? journeyUrl(from, to) : '/planner';
  const isSaved = library.saved.some((trip) => trip.from === from && trip.to === to);

  useEffect(() => {
    if (page !== '/planner' || !route?.legs.length) { lastRecordedJourney.current = ''; return; }
    const key = journeyKey(from, to);
    if (lastRecordedJourney.current === key) return;
    lastRecordedJourney.current = key;
    recordRecent(from, to);
  }, [page, route, from, to, recordRecent]);

  useEffect(() => {
    const sync = () => {
      setPage(window.location.pathname);
      const selection = readJourneySelection(window.location.search);
      setFrom(selection.from); setTo(selection.to); setPlanned(selection.valid); setInvalidLink(selection.invalidLink);
      setDialog(null); setMobileView('steps');
      appScroll.current?.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  useEffect(() => { document.title = page === '/coverage' ? 'Coverage & data status · Routely' : page === '/planner' ? 'Plan an Abuja journey · Routely' : 'Routely · Know your Abuja journey'; }, [page]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 5000); return () => window.clearTimeout(timer); }, [toast]);

  function navigate(path: string) {
    setDialog(null);
    if (window.location.pathname + window.location.search === path) return;
    window.history.pushState({}, '', path);
    setPage(path.split('?')[0]);
    requestAnimationFrame(() => appScroll.current?.scrollTo({ top: 0 }));
  }
  function changeMobileView(view: 'steps' | 'map') {
    setMobileView(view);
    requestAnimationFrame(() => {
      const availableHeight = window.visualViewport?.height || window.innerHeight;
      if (view === 'map' && availableHeight < 540) {
        appScroll.current?.querySelector('.journey-map-canvas')?.scrollIntoView({ block: 'start' });
      } else if (view === 'steps' && planned && resultHeading.current) {
        resultHeading.current.focus();
      } else {
        appScroll.current?.scrollTo({ top: 0 });
      }
    });
  }
  function planJourney(start: string, end: string) {
    if (!getParkById(start) || !getParkById(end) || start === end) return;
    if (findRoutePath(start, end)?.legs.length) {
      lastRecordedJourney.current = journeyKey(start, end);
      recordRecent(start, end);
    }
    const url = journeyUrl(start, end);
    if (window.location.pathname + window.location.search !== url) window.history.pushState({}, '', url);
    setPage('/planner'); setFrom(start); setTo(end); setPlanned(true); setInvalidLink(false); setMobileView('steps'); setDialog(null); setFocusedLocation(null);
    requestAnimationFrame(() => appScroll.current?.scrollTo({ top: 0 }));
    window.setTimeout(() => resultHeading.current?.focus(), 100);
  }
  function submit(event: FormEvent) { event.preventDefault(); planJourney(from, to); }
  function saveCurrentJourney() {
    const result = toggleSaved(from, to);
    if (result.action === 'limit') { setToast(`You can save up to ${MAX_SAVED_JOURNEYS} journeys. Remove one to make room.`); return; }
    if (result.action === 'invalid') return;
    if (!result.persisted) { setToast('Updated for this visit. This browser could not store your journeys.'); return; }
    setToast(result.action === 'saved' ? 'Journey saved on this device.' : 'Journey removed from saved journeys.');
  }
  function openHelper(returnFocusTo: HTMLElement | null) {
    helperReturnFocus.current = returnFocusTo;
    setDialog('helper');
  }
  function closeHelper() {
    const returnFocusTo = helperReturnFocus.current;
    setDialog(null);
    requestAnimationFrame(() => { if (returnFocusTo?.isConnected) returnFocusTo.focus({ preventScroll: true }); });
  }
  const selectFrom = useCallback((id: string) => { setFrom(id); setPlanned(false); setInvalidLink(false); setFocusedLocation(null); }, []);
  const selectTo = useCallback((id: string) => { setTo(id); setPlanned(false); setInvalidLink(false); setFocusedLocation(null); }, []);
  function locate() {
    if (!navigator.geolocation) { setLocationStatus('unavailable'); return; }
    setLocationStatus('searching');
    const request = ++locationRequest.current;
    navigator.geolocation.getCurrentPosition((position) => {
      if (locationRequest.current !== request) return;
      setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy });
      setLocationStatus('ready');
    }, (error) => { if (locationRequest.current === request) setLocationStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable'); },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  }
  function focusStop(id: string) {
    const stop = getParkById(id);
    if (!stop) return;
    setFocusedLocation({ latitude: stop.latitude, longitude: stop.longitude }); changeMobileView('map');
  }
  async function copyShareLink() {
    try { await navigator.clipboard.writeText(shareUrl); setToast('Journey link copied.'); }
    catch { setToast('Copy the link from the field below.'); }
  }

  return <div className="planner-page" ref={appScroll}>
    <a className="journey-skip" href="#main-content">Skip to main content</a>
    <AppHeader page={page} plannerHref={plannerHref} onNavigate={navigate} onOpenHelper={openHelper} />
    {page === '/coverage' ? <CoveragePage onPlan={planJourney} onReport={() => setDialog('report')} /> : page !== '/planner' ? <LandingPage onOpenPlanner={() => navigate(plannerHref)} onViewCoverage={() => navigate('/coverage')} /> : <>
      <div className="journey-mobile-switch" role="group" aria-label="Journey view"><button aria-pressed={mobileView === 'steps'} onClick={() => changeMobileView('steps')} aria-label="Show journey steps"><Route size={17} /> Steps</button><button aria-pressed={mobileView === 'map'} onClick={() => changeMobileView('map')} aria-label="Show journey map"><MapIcon size={17} /> Map</button></div>
      <main className={'planner-content mobile-' + mobileView} id="main-content">
        <section className="journey-sidebar" aria-label="Plan and review your journey">
          <div className="journey-intro"><span className="journey-eyebrow"><span /> ABUJA, ONE JOURNEY AT A TIME</span><h1>Where are you heading?</h1><p>Find where to board, where to change, and where to get off.</p></div>
          <div className="journey-data-notice"><ClipboardCheck size={19} /><p><strong>Sample network</strong> · Boarding points and connections need checking. <a href="/coverage" onClick={(event) => { event.preventDefault(); navigate('/coverage'); }}>See coverage</a></p></div>
          {invalidLink && <p className="journey-error" role="alert">This link contains an unsupported or incomplete journey. Choose two stops below.</p>}
          <form className="journey-form" onSubmit={submit}>
            <div className="journey-field"><span className="field-stop-dot">A</span><StopPicker id="journey-from" value={origin} label="Where are you starting?" onSelect={selectFrom} /></div>
            <div className="journey-between"><button className="journey-locate" type="button" onClick={locate} disabled={locationStatus === 'searching'}><LocateFixed size={15} />{locationStatus === 'searching' ? 'Finding nearby stops…' : 'Find stops near me'}</button><button type="button" className="journey-swap" aria-label="Swap start and destination" onClick={() => { selectFrom(to); selectTo(from); }} disabled={!from && !to}><ArrowDownUp size={17} /></button></div>
            <div aria-live="polite" className="journey-location-status">
              {locationStatus === 'denied' && <p>Location permission is blocked. Choose your starting stop manually or enable location in your browser settings.</p>}
              {locationStatus === 'unavailable' && <p>Your location could not be found. You can still choose your starting stop.</p>}
              {locationStatus === 'ready' && locationOutsideCoverage && <p>Your location is outside the current mapped area. Choose an Abuja starting stop below.</p>}
              {locationStatus === 'ready' && !locationOutsideCoverage && <div className="nearby-choices"><strong>Choose a nearby starting stop</strong><span>Straight-line distance · boarding points need checking</span>{userLocation && userLocation.accuracy > 500 && <p>Location accuracy is about ±{Math.round(userLocation.accuracy)} m.</p>}{nearby.map((park) => <button type="button" key={park.id} onClick={() => selectFrom(park.id)}><MapPin size={15} /><span>{shortStopName(park)}</span><small>{park.distanceKm < 1 ? Math.round(park.distanceKm * 1000) + ' m' : park.distanceKm.toFixed(1) + ' km'}</small></button>)}</div>}
            </div>
            <div className="journey-field"><span className="field-stop-dot destination">B</span><StopPicker id="journey-to" value={destination} label="Where are you going?" onSelect={selectTo} /></div>
            <p className="journey-search-hint">Search by area, stop name or nickname, such as Banex or AYA.</p>
            {from && from === to && <p className="journey-error" role="alert">You selected the same stop. Choose a different destination.</p>}
            <button type="submit" className="journey-primary journey-find" disabled={!from || !to || from === to}>Find a journey<ArrowRight size={18} /></button>
          </form>
          <JourneyLibraryPanel library={library} planned={planned} storageUnavailable={storageUnavailable} onPlan={planJourney} onRemove={(start, end) => { const persisted = removeSaved(start, end); setToast(persisted ? 'Journey removed from saved journeys.' : 'Removed for this visit. Browser storage is unavailable.'); }} onClearRecent={() => { const persisted = clearRecent(); setToast(persisted ? 'Recent searches cleared. Saved journeys are unchanged.' : 'Cleared for this visit. Browser storage is unavailable.'); }} />
          {planned && route ? <section className="journey-results" aria-labelledby="journey-result-title">
            <div className="journey-result-heading"><span className={status.isVerified ? 'journey-status status-verified' : 'journey-status status-sample'}>{status.isVerified ? <CheckCircle2 size={14} /> : <ClipboardCheck size={14} />}{status.isVerified ? 'Field-checked connections' : 'Sample journey · needs checking'}</span><h2 id="journey-result-title" ref={resultHeading} tabIndex={-1}>{shortStopName(origin)}<ArrowRight size={20} />{shortStopName(destination)}</h2><div className="journey-facts"><span><Route size={15} />{route.legs.length} {route.legs.length === 1 ? 'ride' : 'rides'}</span><span>{route.transferPoints.length === 0 ? 'No changes' : route.transferPoints.length + (route.transferPoints.length === 1 ? ' change' : ' changes')}</span></div><p className="journey-muted">Fewest mapped rides. Time and fare information is unavailable.</p></div>
            <div className="journey-result-actions"><button className="journey-secondary journey-save" aria-pressed={isSaved} onClick={saveCurrentJourney}>{isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}{isSaved ? 'Saved journey' : 'Save journey'}</button><button className="journey-secondary" onClick={() => setDialog('share')}><Share2 size={15} /> Share</button><button className="journey-secondary" onClick={() => { downloadText('routely-' + from + '-to-' + to + '.txt', journeyText(from, to)); setToast('Journey steps downloaded, including data status.'); }}><Download size={15} /> Download steps</button></div>
            <ol className="journey-steps">{route.legs.map((leg, index) => <li key={leg.from + leg.to}>
              <span className="journey-step-number">{index + 1}</span><article className="journey-leg"><span className="journey-leg-kicker">{index === 0 ? 'BOARD' : 'CHANGE VEHICLES'} · {transportLabel(leg)}</span><h3>{index === 0 ? 'Start at ' : 'Change at '}{shortStopName(getParkById(leg.from))}</h3>
                <dl><div><dt>Board here</dt><dd>{leg.boardingLandmark || 'Exact boarding landmark needs checking.'}</dd></div><div><dt>{isConnectionVerified(leg) ? 'Take' : 'Sample instruction'}</dt><dd>{leg.instruction}</dd></div><div><dt>Get off at</dt><dd>{leg.alightingLandmark || shortStopName(getParkById(leg.to)) + ' — exact alighting point needs checking.'}</dd></div></dl>
                {leg.serviceNotes && <p className="journey-note">{leg.serviceNotes}</p>}
                <p className="journey-leg-evidence">{isConnectionVerified(leg) ? 'Checked ' + leg.verification!.checkedAt + ' · ' + leg.verification!.source : 'Sample connection · service and direction unverified'}</p>
                <div className="journey-leg-map-actions"><button onClick={() => focusStop(leg.from)}><MapPin size={14} /> Boarding stop</button><button onClick={() => focusStop(leg.to)}><MapPin size={14} /> Alighting stop</button></div>
              </article>
            </li>)}<li className="journey-arrival"><span className="journey-step-number arrival"><CheckCircle2 size={17} /></span><div><span className="journey-leg-kicker">ARRIVE</span><h3>{shortStopName(destination)}</h3><p>Confirm the destination and boarding point with the driver or operator before travelling.</p></div></li></ol>
            <button className="journey-report-link" onClick={() => setDialog('report')}><Flag size={15} /> Something looks wrong? Record a correction</button>
          </section> : planned ? <div className="journey-empty"><Route size={28} /><h2>No mapped connection yet</h2><p>This journey is outside the current sample connections. Try another pair of stops or record what you know.</p><button className="journey-secondary" onClick={() => setDialog('report')}>Record a connection</button></div> : <section className="journey-suggestions"><span className="journey-eyebrow">TRY A SAMPLE JOURNEY</span>{PILOT_JOURNEYS.slice(0, 3).map((journey) => <button key={journey.from + journey.to} onClick={() => planJourney(journey.from, journey.to)}><span><MapPin size={15} />{shortStopName(getParkById(journey.from))}<ArrowRight size={13} />{shortStopName(getParkById(journey.to))}</span><ChevronRight size={16} /></button>)}<p><Footprints size={16} /> Start with a mapped stop. Street addresses and walking directions are not available yet.</p></section>}
          <div className="journey-sidebar-footer"><span>Built for everyday Abuja journeys.</span><button onClick={(event) => openHelper(event.currentTarget)}>Need help choosing a route?<MessageCircle size={14} /></button></div>
        </section>
        <section className="journey-map-area" aria-label="Abuja stops and journey map">
          <div className="journey-map-heading"><div><span className="journey-eyebrow"><Navigation size={14} /> EXPLORE THE NETWORK</span><strong>{planned ? shortStopName(origin) + ' → ' + shortStopName(destination) : 'Your journey starts with a stop.'}</strong></div><span className="map-city-label">Abuja, Nigeria</span></div>
          <div className="journey-map-canvas"><button type="button" className="journey-secondary journey-map-back" aria-label="Back to journey steps" onClick={() => changeMobileView('steps')}><ArrowLeft size={18} /> Steps</button><Suspense fallback={<div className="journey-map-loading" role="status">Loading the map… Your journey form is ready.</div>}><Map carParks={carParks} activeRoute={route} origin={origin} destination={destination} userLocation={userLocation} themeMode={mode} focusedLocation={focusedLocation} onSetOrigin={selectFrom} onSetDestination={selectTo} /></Suspense></div>
          <div className="journey-map-caption"><ClipboardCheck size={17} /><p>{hasSchematic ? 'Dashed lines show sample connections between stop pins, not the streets travelled.' : route ? 'Solid lines show recorded travel paths. Check each connection’s data status.' : 'Pins show sample stop locations. Choose a pin to set your start or destination.'}</p><button onClick={() => navigate('/coverage')}>Data status<ArrowRight size={14} /></button></div>
        </section>
      </main>
    </>}
    {dialog === 'helper' && <Suspense fallback={<Modal title="Opening journey helper" onClose={closeHelper}><p role="status">Loading the optional helper…</p></Modal>}><JourneyAssistant from={from} to={to} onClose={closeHelper} onPlan={planJourney} /></Suspense>}
    {dialog === 'report' && <ReportDialog from={from} to={to} onClose={() => setDialog(null)} onSaved={() => setReportVersion((version) => version + 1)} />}
    {dialog === 'share' && <Modal title="Share this journey" onClose={() => setDialog(null)}><p className="journey-muted">The link opens the same stops and current route data. Sample journeys remain marked as sample.</p><label className="share-label" htmlFor="share-link">Journey link</label><input className="share-link-input" id="share-link" value={shareUrl} readOnly onFocus={(event) => event.target.select()} /><button className="journey-primary" onClick={() => void copyShareLink()}><Share2 size={16} /> Copy journey link</button></Modal>}
    {toast && <div className="journey-toast" role="status">{toast}</div>}
  </div>;
}

export default App;
