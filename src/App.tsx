import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Autocomplete,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  MapPin,
  Compass,
  Sparkles,
  Moon,
  Sun,
  ArrowLeftRight,
  Map as MapIcon,
  SendHorizontal,
  User,
  Navigation,
  Car,
  Route,
  PanelLeftClose,
  PanelLeftOpen,
  LocateFixed,
} from 'lucide-react';
import Map from './Map';
import LandingPage from './LandingPage';
import { carParks, findRoutePath, searchParks, parseAndRespondAI } from './data';
import type { RoutePath, CarPark } from './types';
import { useThemeMode } from './ThemeContext';

type UserLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type ActiveTab = 'route' | 'nearby';
type RightPanelView = 'map' | 'ai';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  origin?: CarPark;
  destination?: CarPark;
  route?: RoutePath | null;
  timestamp: string;
}

const PRESET_PARKS = [
  { id: 'wuse2', label: 'Wuse 2' },
  { id: 'jabi', label: 'Jabi' },
  { id: 'garki', label: 'Garki' },
  { id: 'cbd', label: 'CBD' },
  { id: 'airport', label: 'Airport' },
  { id: 'kubwa', label: 'Kubwa' },
];

// SVG brand logo mark
function BrandLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="8" r="4.5" fill="white" fillOpacity="0.95" />
      <circle cx="11" cy="8" r="2.2" fill="url(#rg)" />
      <path d="M11 12.5 L7 20 Q11 17 15 20 Z" fill="white" fillOpacity="0.9" />
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PlannerApp({ onGoHome }: { onGoHome: () => void }) {
  const { mode, toggleMode } = useThemeMode();
  const [activeTab, setActiveTab] = useState<ActiveTab>('route');
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>('map');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [originId, setOriginId] = useState<string>(carParks[0].id);
  const [destinationId, setDestinationId] = useState<string>(carParks[1].id);
  const [parkFilter, setParkFilter] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'unknown' | 'searching' | 'granted' | 'denied' | 'unavailable'>('unknown');
  const [focusedStepIndex, setFocusedStepIndex] = useState<number | null>(null);
  const [focusedLocation, setFocusedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [swapSpin, setSwapSpin] = useState(false);

  // Dedicated AI Workspace Chat History
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Welcome to Routely AI Assistant! Ask me anything about commuting in Abuja. Try: "How do I get to Airport from Wuse 2?" or "What are the major transport hubs?"',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const filteredParks = useMemo(() => searchParks(parkFilter), [parkFilter]);
  const origin = useMemo(() => carParks.find((park) => park.id === originId), [originId]);
  const destination = useMemo(() => carParks.find((park) => park.id === destinationId), [destinationId]);
  const route = useMemo<RoutePath | null>(() => findRoutePath(originId, destinationId), [originId, destinationId]);

  // Suggested alternative when no route found
  const suggestedAlternative = useMemo(() => {
    if (route) return null;
    const hubs = ['wuse2', 'jabi', 'garki'];
    for (const hub of hubs) {
      if (hub !== originId && hub !== destinationId) {
        const r1 = findRoutePath(originId, hub);
        const r2 = findRoutePath(hub, destinationId);
        if (r1 && r2) return carParks.find(p => p.id === hub);
      }
    }
    return null;
  }, [originId, destinationId, route]);

  const handleSwap = () => {
    setSwapSpin(true);
    setTimeout(() => setSwapSpin(false), 400);
    const temp = originId;
    setOriginId(destinationId);
    setDestinationId(temp);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) { setLocationStatus('unavailable'); return; }
    setLocationStatus('searching');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? 0,
        });
        setLocationStatus('granted');
      },
      (error) => {
        setLocationStatus(
          error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable',
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  };

  const nearbyParks = useMemo(() => {
    if (!userLocation) return [];
    return [...carParks]
      .map((park) => ({
        ...park,
        distance: Math.hypot(park.longitude - userLocation.longitude, park.latitude - userLocation.latitude),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [userLocation]);

  const handleStepClick = (index: number) => {
    setFocusedStepIndex(index);
    if (!route) return;
    if (index === 0 && origin) {
      setFocusedLocation({ latitude: origin.latitude, longitude: origin.longitude });
    } else if (index === route.steps.length - 1 && destination) {
      setFocusedLocation({ latitude: destination.latitude, longitude: destination.longitude });
    } else if (route.transferPoints[index - 1]) {
      const match = carParks.find((p) => p.name === route.transferPoints[index - 1]);
      if (match) setFocusedLocation({ latitude: match.latitude, longitude: match.longitude });
    }
  };

  const handleSendAiMessage = (promptOverride?: string) => {
    const textToSend = promptOverride ?? aiInputText;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const aiRes = parseAndRespondAI(textToSend, originId, destinationId);
    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: 'bot',
      text: aiRes.text,
      origin: aiRes.origin,
      destination: aiRes.destination,
      route: aiRes.route,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg, botMsg]);
    if (!promptOverride) setAiInputText('');
  };

  const handleApplyAiRouteToMap = (msgOrigin?: CarPark, msgDest?: CarPark) => {
    if (msgOrigin) setOriginId(msgOrigin.id);
    if (msgDest) setDestinationId(msgDest.id);
    setRightPanelView('map');
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Header Bar */}
        <div className="sidebar-header">
          <Tooltip title="Back to landing page" placement={sidebarCollapsed ? 'right' : 'bottom'}>
            <button className="sidebar-brand sidebar-home-link" onClick={onGoHome} aria-label="Back to landing page">
              <div className="brand-icon">
                <BrandLogo />
              </div>
              {!sidebarCollapsed && (
                <div className="brand-text">
                  <h1>Routely</h1>
                  <span className="subtitle">Abuja Transit Planner</span>
                </div>
              )}
            </button>
          </Tooltip>
          <div className="header-actions">
            {!sidebarCollapsed && (
              <Tooltip title={rightPanelView === 'ai' ? 'Close AI' : 'Open AI Assistant'}>
                <button
                  className={`btn-ai-header-logo ${rightPanelView === 'ai' ? 'active' : ''}`}
                  onClick={() => setRightPanelView((prev) => (prev === 'ai' ? 'map' : 'ai'))}
                >
                  <Sparkles size={15} /> AI
                </button>
              </Tooltip>
            )}
            <Tooltip title={mode === 'light' ? 'Dark Mode' : 'Light Mode'}>
              <button className="icon-btn" onClick={toggleMode} aria-label="Toggle Theme">
                {mode === 'light' ? <Moon size={17} /> : <Sun size={17} />}
              </button>
            </Tooltip>
            <Tooltip title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
              <button className="icon-btn" onClick={() => setSidebarCollapsed(p => !p)} aria-label="Toggle Sidebar">
                {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Collapsed Rail: icon-only tab buttons */}
        {sidebarCollapsed ? (
          <div className="sidebar-rail">
            <Tooltip title="Route" placement="right">
              <button className={`rail-btn ${activeTab === 'route' ? 'active' : ''}`} onClick={() => { setActiveTab('route'); setSidebarCollapsed(false); }}>
                <Route size={20} />
              </button>
            </Tooltip>
            <Tooltip title="Nearby Parks" placement="right">
              <button className={`rail-btn ${activeTab === 'nearby' ? 'active' : ''}`} onClick={() => { setActiveTab('nearby'); setSidebarCollapsed(false); }}>
                <Compass size={20} />
              </button>
            </Tooltip>
            <Tooltip title="AI Assistant" placement="right">
              <button className={`rail-btn ${rightPanelView === 'ai' ? 'active' : ''}`} onClick={() => setRightPanelView(p => p === 'ai' ? 'map' : 'ai')}>
                <Sparkles size={20} />
              </button>
            </Tooltip>
            <Tooltip title="Toggle GPS" placement="right">
              <button className={`rail-btn ${locationStatus === 'granted' ? 'gps-active' : ''}`} onClick={handleUseLocation}>
                <LocateFixed size={20} />
              </button>
            </Tooltip>
          </div>
        ) : (
          <>
            {/* Tabbed Navigation */}
            <div className="tab-navigation">
              <button
                className={`tab-button ${activeTab === 'route' ? 'active' : ''}`}
                onClick={() => setActiveTab('route')}
              >
                <Route size={15} /> Route
                {activeTab === 'route' && <span className="tab-active-bar" />}
              </button>
              <button
                className={`tab-button ${activeTab === 'nearby' ? 'active' : ''}`}
                onClick={() => setActiveTab('nearby')}
              >
                <Compass size={15} /> Nearby
                {activeTab === 'nearby' && <span className="tab-active-bar" />}
              </button>
              <button
                className={`tab-button ${rightPanelView === 'ai' ? 'active' : ''}`}
                onClick={() => setRightPanelView((prev) => (prev === 'ai' ? 'map' : 'ai'))}
              >
                <Sparkles size={15} /> AI
                {rightPanelView === 'ai' && <span className="tab-active-bar" />}
              </button>
            </div>

            {/* Sidebar Body */}
            <div className="sidebar-body">
              {/* Status Pill */}
              <div className="location-pill">
                <div className="location-pill-status">
                  <span
                    className={`status-dot ${locationStatus === 'granted' ? 'active' : locationStatus === 'searching' ? 'searching' : ''}`}
                  />
                  <span>
                    {locationStatus === 'granted' ? 'Location Active'
                      : locationStatus === 'searching' ? 'Locating...'
                      : locationStatus === 'denied' ? 'Permission Blocked'
                      : locationStatus === 'unavailable' ? 'Location Unavailable'
                      : 'Location Off'}
                  </span>
                </div>
                <button className="btn-locate" onClick={handleUseLocation}>
                  <LocateFixed size={13} />
                  {locationStatus === 'searching' ? 'Finding...' : userLocation ? 'Refresh' : 'Enable GPS'}
                </button>
              </div>

              {/* ── ROUTE TAB ── */}
              {activeTab === 'route' && (
                <div className="tab-content-fade">
                  {/* Stacked Input Card */}
                  <div className="route-input-card">
                    <div className="input-stack-container">
                      <div className="input-visual-vector">
                        <div className="vector-node origin" />
                        <div className="vector-line" />
                        <div className="vector-node destination" />
                      </div>

                      <div className="input-fields-wrapper">
                        <FormControl size="small" className="select-field">
                          <InputLabel id="origin-select-label">Origin (A)</InputLabel>
                          <Select
                            labelId="origin-select-label"
                            label="Origin (A)"
                            value={originId}
                            renderValue={(selectedId) => carParks.find((park) => park.id === selectedId)?.zone ?? ''}
                            onChange={(e) => setOriginId(e.target.value)}
                          >
                            {carParks.map((park) => (
                              <MenuItem key={park.id} value={park.id}>
                                {park.name} ({park.zone})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl size="small" className="select-field">
                          <InputLabel id="dest-select-label">Destination (B)</InputLabel>
                          <Select
                            labelId="dest-select-label"
                            label="Destination (B)"
                            value={destinationId}
                            renderValue={(selectedId) => carParks.find((park) => park.id === selectedId)?.zone ?? ''}
                            onChange={(e) => setDestinationId(e.target.value)}
                          >
                            {carParks.map((park) => (
                              <MenuItem key={park.id} value={park.id}>
                                {park.name} ({park.zone})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>

                      <Tooltip title="Swap Origin & Destination">
                        <button
                          className={`btn-swap ${swapSpin ? 'spinning' : ''}`}
                          onClick={handleSwap}
                          aria-label="Swap origin and destination"
                        >
                          <ArrowLeftRight size={16} />
                          <span className="swap-label">Swap</span>
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Quick Destination Preset Chips */}
                  <div className="quick-preset-container">
                    <span className="preset-label">Quick Destinations</span>
                    <div className="preset-chips-row">
                      {PRESET_PARKS.map((preset) => {
                        const isOrigin = preset.id === originId;
                        const isActive = preset.id === destinationId;
                        return (
                          <button
                            key={preset.id}
                            className={`preset-chip ${isActive ? 'active' : ''} ${isOrigin ? 'muted' : ''}`}
                            disabled={isOrigin}
                            title={isOrigin ? 'Already set as origin' : undefined}
                            onClick={() => {
                              setDestinationId(preset.id);
                              if (rightPanelView !== 'map') setRightPanelView('map');
                            }}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Autocomplete Search */}
                  <Autocomplete
                    freeSolo
                    size="small"
                    slotProps={{
                      listbox: {
                        sx: {
                          '& .MuiAutocomplete-option': {
                            minHeight: 32,
                            padding: '5px 10px',
                            fontSize: '13px',
                            lineHeight: 1.35,
                          },
                        },
                      },
                    }}
                    options={filteredParks}
                    getOptionLabel={(option: string | CarPark) => (typeof option === 'string' ? option : option.name)}
                    inputValue={parkFilter}
                    onInputChange={(_, value) => setParkFilter(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search parks (e.g. Wuse, Garki, Jabi...)"
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            minHeight: 40,
                            height: 40,
                            padding: '0 8px',
                            borderRadius: '10px',
                          },
                          '& .MuiOutlinedInput-input': {
                            padding: '8px 4px',
                            fontSize: '13px',
                            lineHeight: '20px',
                          },
                          '& .MuiAutocomplete-endAdornment': { top: 'calc(50% - 12px)' },
                          '& .MuiAutocomplete-popupIndicator svg, & .MuiAutocomplete-clearIndicator svg': {
                            width: 18,
                            height: 18,
                          },
                        }}
                      />
                    )}
                  />

                  {/* Route Summary & Timeline */}
                  {route ? (
                    <div className="route-summary-card route-card-enter">
                      <div className="route-summary-header">
                        <h3 className="route-title">
                          {origin?.name.replace(' Car Park', '')} → {destination?.name.replace(' Car Park', '')}
                        </h3>
                        <span className="route-badge">
                          {route.legs.length === 1 ? 'Direct' : `${route.legs.length} Legs`}
                        </span>
                      </div>

                      <div className="route-transfer-info">
                        {route.transferPoints.length > 0 ? (
                          <span>Transfers at: <strong>{route.transferPoints.join(', ')}</strong></span>
                        ) : (
                          <span>Direct route — no transfers required.</span>
                        )}
                      </div>

                      <div className="timeline-container" style={{ marginTop: 14 }}>
                        <span className="preset-label">Step-by-Step Guidance</span>
                        <div className="timeline-steps-wrapper">
                          {route.steps.map((step, idx) => (
                            <div
                              key={idx}
                              className={`timeline-step-item ${focusedStepIndex === idx ? 'focused' : ''}`}
                              onClick={() => {
                                handleStepClick(idx);
                                if (rightPanelView !== 'map') setRightPanelView('map');
                              }}
                            >
                              <div className="step-track">
                                <div className="step-num-badge">{idx + 1}</div>
                                {idx < route.steps.length - 1 && <div className="step-connector-line" />}
                              </div>
                              <div className="step-content">{step}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state-card">
                      <div className="empty-state-icon">
                        <MapPin size={32} strokeWidth={1.5} />
                      </div>
                      <p className="empty-state-title">No route found</p>
                      <p className="empty-state-desc">
                        No direct path found between these parks.
                        {suggestedAlternative && (
                          <> Try routing via <strong>{suggestedAlternative.name.replace(' Car Park', '')}</strong> as a transfer hub.</>
                        )}
                      </p>
                      {suggestedAlternative && (
                        <div className="empty-state-actions">
                          <button className="btn-chip-action" onClick={() => setDestinationId(suggestedAlternative.id)}>
                            Go via {suggestedAlternative.name.replace(' Car Park', '')}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── NEARBY TAB ── */}
              {activeTab === 'nearby' && (
                <div className="tab-content-fade nearby-list">
                  <span className="preset-label">Nearest Abuja Car Parks</span>
                  {userLocation && nearbyParks.length > 0 ? (
                    nearbyParks.map((park) => (
                      <div key={park.id} className="nearby-item-card">
                        <div className="nearby-item-info">
                          <h4>{park.name}</h4>
                          <span>Zone: {park.zone}</span>
                        </div>
                        <div className="nearby-actions">
                          <button
                            className="btn-chip-action"
                            onClick={() => { setOriginId(park.id); setActiveTab('route'); setRightPanelView('map'); }}
                          >
                            From
                          </button>
                          <button
                            className="btn-chip-action"
                            onClick={() => { setDestinationId(park.id); setActiveTab('route'); setRightPanelView('map'); }}
                          >
                            To
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state-card">
                      <div className="empty-state-icon">
                        <LocateFixed size={32} strokeWidth={1.5} />
                      </div>
                      <p className="empty-state-title">GPS not active</p>
                      <p className="empty-state-desc">Enable your location to discover nearby car parks sorted by distance.</p>
                      <div className="empty-state-actions">
                        <Button variant="contained" size="small" onClick={handleUseLocation} sx={{ borderRadius: '8px', fontWeight: 700 }}>
                          Enable Location
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      {/* Right Panel */}
      {rightPanelView === 'map' ? (
        <main className="map-panel">
          <Map
            carParks={carParks}
            activeRoute={route}
            origin={origin}
            destination={destination}
            userLocation={userLocation}
            themeMode={mode}
            focusedLocation={focusedLocation}
            onSetOrigin={setOriginId}
            onSetDestination={setDestinationId}
          />
        </main>
      ) : (
        <main className="ai-workspace-panel">
          {/* AI Panel Header */}
          <div className="ai-workspace-header">
            <div className="ai-header-brand">
              <div className="ai-avatar-badge"><Sparkles size={20} /></div>
              <div className="ai-header-title">
                <h3>Routely AI Assistant</h3>
                <span>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: 4 }} />
                  Active Transit Intelligence
                </span>
              </div>
            </div>
            <button className="btn-view-map" onClick={() => setRightPanelView('map')}>
              <MapIcon size={15} /> Map View
            </button>
          </div>

          {/* Chat Messages Thread */}
          <div className="ai-chat-messages">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-row ${msg.sender} bubble-pop`}>
                <div className={`chat-avatar ${msg.sender}`}>
                  {msg.sender === 'user' ? <User size={15} /> : <Sparkles size={15} />}
                </div>
                <div className="chat-bubble">
                  <div>{msg.text}</div>

                  {/* Embedded Route Card */}
                  {msg.route && msg.origin && msg.destination && (
                    <div className="ai-route-card-embedded">
                      <div className="ai-route-card-header">
                        <strong>
                          <MapPin size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          {msg.origin.name.replace(' Car Park', '')} → {msg.destination.name.replace(' Car Park', '')}
                        </strong>
                        <span className="route-badge">
                          {msg.route.legs.length === 1 ? 'Direct' : `${msg.route.legs.length} Legs`}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {msg.route.transferPoints.length > 0
                          ? `Transfers at: ${msg.route.transferPoints.join(', ')}`
                          : 'Direct route with no transfers.'}
                      </div>
                      <button
                        className="btn-show-on-map"
                        onClick={() => handleApplyAiRouteToMap(msg.origin, msg.destination)}
                      >
                        <MapIcon size={13} />Show Route on Map
                      </button>
                    </div>
                  )}

                  <div className={`chat-timestamp ${msg.sender}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* AI Footer */}
          <div className="ai-workspace-footer">
            <div className="ai-preset-prompts-row">
              <button className="ai-preset-prompt-chip" onClick={() => handleSendAiMessage('How do I get to Airport from Wuse 2?')}>
                <Navigation size={12} /> Wuse 2 → Airport
              </button>
              <button className="ai-preset-prompt-chip" onClick={() => handleSendAiMessage('Show route from Jabi to Kubwa')}>
                <Car size={12} /> Jabi → Kubwa
              </button>
              <button className="ai-preset-prompt-chip" onClick={() => handleSendAiMessage('What are the major transport hubs in Abuja?')}>
                <MapPin size={12} /> Major Hubs
              </button>
            </div>

            <div className="ai-input-container">
              <input
                type="text"
                className="ai-text-input"
                placeholder="Ask e.g. 'How do I go from Wuse 2 to Kubwa?'"
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendAiMessage(); }}
              />
              <button
                className="btn-ai-send"
                onClick={() => handleSendAiMessage()}
                disabled={!aiInputText.trim()}
              >
                <SendHorizontal size={18} />
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

function App() {
  const [showPlanner, setShowPlanner] = useState(() => window.location.pathname === '/planner');

  useEffect(() => {
    const syncPageWithPath = () => setShowPlanner(window.location.pathname === '/planner');
    window.addEventListener('popstate', syncPageWithPath);
    return () => window.removeEventListener('popstate', syncPageWithPath);
  }, []);

  const openPlanner = () => {
    if (window.location.pathname !== '/planner') {
      window.history.pushState({}, '', '/planner');
    }
    setShowPlanner(true);
  };

  const returnToLandingPage = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setShowPlanner(false);
  };

  return showPlanner
    ? <PlannerApp onGoHome={returnToLandingPage} />
    : <LandingPage onOpenPlanner={openPlanner} />;
}

export default App;
