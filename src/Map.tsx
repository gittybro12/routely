import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, LocateFixed, Scan, ZoomIn, ZoomOut } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { CarPark, RoutePath } from './types';
import { routeMapSegments } from './journey';

interface MapProps {
  carParks: CarPark[];
  activeRoute: RoutePath | null;
  origin: CarPark | undefined;
  destination: CarPark | undefined;
  userLocation: { latitude: number; longitude: number; accuracy: number } | null;
  themeMode?: 'light' | 'dark';
  focusedLocation?: { latitude: number; longitude: number } | null;
  onSetOrigin: (parkId: string) => void;
  onSetDestination: (parkId: string) => void;
}

type ParkChoice = 'origin' | 'destination';

const defaultCenter: [number, number] = [7.4937, 9.0579];

const mapStyle = 'https://tiles.openfreemap.org/styles/positron';

function fitCoordinates(map: maplibregl.Map, coordinates: [number, number][], duration = 700) {
  const container = map.getContainer();
  if (!coordinates.length || container.clientWidth === 0 || container.clientHeight === 0) return;
  const bounds = new maplibregl.LngLatBounds();
  coordinates.forEach((coordinate) => bounds.extend(coordinate));
  const legend = container.parentElement?.querySelector('.map-legend');
  const legendHeight = legend?.getBoundingClientRect().height || 0;
  const legendBottom = legend ? Number.parseFloat(window.getComputedStyle(legend).bottom) || 18 : 0;
  const verticalSpace = container.clientHeight;
  const backButtonHeight = container.parentElement?.parentElement?.querySelector('.journey-map-back')?.getBoundingClientRect().height || 0;
  const topPadding = Math.min(backButtonHeight ? backButtonHeight + 44 : 75, verticalSpace * .3);
  map.fitBounds(bounds, {
    padding: {
      top: topPadding,
      right: Math.min(100, container.clientWidth * .3),
      bottom: Math.min(Math.max(legendHeight + legendBottom + 36, 80), Math.max(50, verticalSpace - topPadding - 40)),
      left: Math.min(60, container.clientWidth * .16),
    },
    maxZoom: 14, duration,
  });
}

function createParkPopup(
  park: CarPark,
  onChoosePark: (park: CarPark, choice: ParkChoice) => void,
) {
  const popup = document.createElement('div');
  popup.className = 'routely-park-popup';

  const title = document.createElement('strong');
  title.className = 'routely-park-popup-title';
  title.textContent = park.name;

  const zone = document.createElement('span');
  zone.className = 'routely-park-popup-zone';
  zone.textContent = park.zone;

  const actions = document.createElement('div');
  actions.className = 'routely-park-popup-actions';

  const originButton = document.createElement('button');
  originButton.type = 'button';
  originButton.className = 'routely-popup-action primary';
  originButton.textContent = 'Set as origin';
  originButton.addEventListener('click', () => onChoosePark(park, 'origin'));

  const destinationButton = document.createElement('button');
  destinationButton.type = 'button';
  destinationButton.className = 'routely-popup-action';
  destinationButton.textContent = 'Set as destination';
  destinationButton.addEventListener('click', () => onChoosePark(park, 'destination'));

  actions.append(originButton, destinationButton);
  popup.append(title, zone, actions);
  return popup;
}

export default function Map({
  carParks,
  activeRoute,
  origin,
  destination,
  userLocation,
  themeMode = 'light',
  focusedLocation,
  onSetOrigin,
  onSetDestination,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const locationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const parkMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [mapAttempt, setMapAttempt] = useState(0);
  const [mapError, setMapError] = useState('');
  const [legendOpen, setLegendOpen] = useState(() => !window.matchMedia('(max-width: 960px), (max-height: 540px)').matches);
  const mapSegments = routeMapSegments(activeRoute);
  const viewState = useRef({ activeRoute, focusedLocation });
  useEffect(() => { viewState.current = { activeRoute, focusedLocation }; }, [activeRoute, focusedLocation]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 960px), (max-height: 540px)');
    const syncLegend = () => setLegendOpen(!media.matches);
    media.addEventListener('change', syncLegend);
    return () => media.removeEventListener('change', syncLegend);
  }, []);
  useEffect(() => {
    if (!mapRef.current || focusedLocation) return;
    fitCoordinates(mapRef.current, routeMapSegments(activeRoute).flatMap((segment) => segment.coordinates), 0);
  }, [legendOpen, activeRoute, focusedLocation]);

  useEffect(() => {
    if (!mapContainer.current) return;

    let map: maplibregl.Map;
    try { map = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: defaultCenter,
      zoom: 11,
      attributionControl: { compact: true },
    }); } catch {
      setMapError('The map could not start in this browser. You can still use the journey steps.');
      return;
    }

    mapRef.current = map;
    setMapError('');
    const onError = () => setMapError('Some map tiles could not load. Journey steps are still available.');
    map.on('error', onError);
    const observer = new ResizeObserver(() => {
      if (!map.getContainer().clientWidth || !map.getContainer().clientHeight) return;
      map.resize();
      const view = viewState.current;
      if (view.focusedLocation) {
        map.jumpTo({ center: [view.focusedLocation.longitude, view.focusedLocation.latitude], zoom: 14 });
      } else {
        fitCoordinates(map, routeMapSegments(view.activeRoute).flatMap((segment) => segment.coordinates), 0);
      }
    });
    observer.observe(mapContainer.current);

    return () => {
      observer.disconnect();
      map.off('error', onError);
      locationMarkerRef.current?.remove();
      parkMarkersRef.current.forEach((marker) => marker.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [mapAttempt]);

  const renderParkMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    parkMarkersRef.current.forEach((marker) => marker.remove());
    parkMarkersRef.current = [];

    const selectedIds = new Set<string>();
    const addStopMarker = (park: CarPark, kind: 'origin' | 'destination' | 'transfer', label: string) => {
      selectedIds.add(park.id);

      const element = document.createElement('div');
      element.className = `map-stop-marker ${kind}`;
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', '0');
      element.setAttribute('aria-label', `${kind === 'transfer' ? 'Transfer' : kind} at ${park.name}`);
      element.title = park.name;

      const pin = document.createElement('span');
      pin.className = 'map-stop-pin';
      pin.textContent = label;

      const name = document.createElement('span');
      name.className = 'map-stop-label';
      name.textContent = park.zone;
      element.append(pin, name);

      const popup = new maplibregl.Popup({ offset: 24, closeButton: true })
        .setDOMContent(createParkPopup(park, (selectedPark, choice) => {
          if (choice === 'origin') onSetOrigin(selectedPark.id);
          else onSetDestination(selectedPark.id);
        }));

      const marker = new maplibregl.Marker({ element, anchor: 'center' })
        .setLngLat([park.longitude, park.latitude])
        .setPopup(popup)
        .addTo(map);

      element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); marker.togglePopup(); }
      });

      parkMarkersRef.current.push(marker);
    };

    if (origin) addStopMarker(origin, 'origin', 'A');
    if (destination && destination.id !== origin?.id) addStopMarker(destination, 'destination', 'B');

    const transferParks = (activeRoute?.transferPoints ?? [])
      .map((name) => carParks.find((park) => park.name === name))
      .filter((park): park is CarPark => Boolean(park))
      .filter((park) => !selectedIds.has(park.id));

    transferParks.forEach((park, index) => addStopMarker(park, 'transfer', `T${index + 1}`));

    const otherParks = carParks.filter((park) => !selectedIds.has(park.id));
    const zoom = map.getZoom();
    const cellSize = zoom < 11.5 ? 76 : zoom < 12.5 ? 58 : zoom < 13.5 ? 40 : zoom < 14.25 ? 24 : 0;
    const groups = new globalThis.Map<string, { parks: CarPark[]; longitude: number; latitude: number }>();
    const mapWidth = map.getContainer().clientWidth;
    const mapHeight = map.getContainer().clientHeight;

    otherParks.forEach((park) => {
      const point = map.project([park.longitude, park.latitude]);
      if (point.x < -60 || point.y < -60 || point.x > mapWidth + 60 || point.y > mapHeight + 60) return;

      const key = cellSize > 0
        ? `${Math.floor(point.x / cellSize)}:${Math.floor(point.y / cellSize)}`
        : park.id;
      const group = groups.get(key) ?? { parks: [], longitude: 0, latitude: 0 };
      group.parks.push(park);
      group.longitude += park.longitude;
      group.latitude += park.latitude;
      groups.set(key, group);
    });

    groups.forEach(({ parks, longitude, latitude }) => {
      const center: [number, number] = [longitude / parks.length, latitude / parks.length];

      if (parks.length > 1) {
        const clusterButton = document.createElement('button');
        clusterButton.type = 'button';
        clusterButton.className = 'park-cluster-marker';
        clusterButton.textContent = String(parks.length);
        clusterButton.setAttribute('aria-label', `${parks.length} nearby car parks. Zoom in to view them.`);
        clusterButton.title = `${parks.length} nearby car parks`;
        clusterButton.addEventListener('click', (event) => {
          event.stopPropagation();
          map.easeTo({ center, zoom: Math.min(map.getZoom() + 2, 16), duration: 450 });
        });

        parkMarkersRef.current.push(
          new maplibregl.Marker({ element: clusterButton, anchor: 'center' })
            .setLngLat(center)
            .addTo(map),
        );
        return;
      }

      const park = parks[0];
      const parkButton = document.createElement('button');
      parkButton.type = 'button';
      parkButton.className = 'park-pin-marker';
      parkButton.setAttribute('aria-label', park.name);
      parkButton.title = park.name;

      const popup = new maplibregl.Popup({ offset: 18, closeButton: true })
        .setDOMContent(createParkPopup(park, (selectedPark, choice) => {
          if (choice === 'origin') onSetOrigin(selectedPark.id);
          else onSetDestination(selectedPark.id);
        }));

      parkMarkersRef.current.push(
        new maplibregl.Marker({ element: parkButton, anchor: 'center' })
          .setLngLat([park.longitude, park.latitude])
          .setPopup(popup)
          .addTo(map),
      );
    });
  }, [activeRoute, carParks, destination, onSetDestination, onSetOrigin, origin]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateMarkers = () => renderParkMarkers();
    if (map.isStyleLoaded()) updateMarkers();
    else map.once('load', updateMarkers);

    map.on('moveend', updateMarkers);
    return () => {
      map.off('load', updateMarkers);
      map.off('moveend', updateMarkers);
    };
  }, [renderParkMarkers, mapAttempt]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const drawRoute = () => {
      ['route-line-recorded', 'route-line-schematic', 'route-line-outline'].forEach((layerId) => {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
      });
      if (map.getSource('route-line')) map.removeSource('route-line');
      if (!activeRoute || !origin || !destination) return;

      const segments = routeMapSegments(activeRoute);
      const coordinates = segments.flatMap((segment) => segment.coordinates);
      if (!coordinates.length) return;

      map.addSource('route-line', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: segments.map((segment) => ({ type: 'Feature', properties: { recorded: segment.recorded },
            geometry: { type: 'LineString', coordinates: segment.coordinates } })),
        },
      });

      const lineColor = themeMode === 'dark' ? '#4d9a88' : '#176f64';
      const lineOutline = themeMode === 'dark' ? '#eef3ed' : '#fbfaf6';

      map.addLayer({
        id: 'route-line-outline',
        type: 'line',
        source: 'route-line',
        filter: ['==', ['get', 'recorded'], true],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': lineOutline, 'line-width': 7, 'line-opacity': 0.92 },
      });
      map.addLayer({
        id: 'route-line-recorded',
        type: 'line',
        source: 'route-line',
        filter: ['==', ['get', 'recorded'], true],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': lineColor, 'line-width': 4 },
      });
      map.addLayer({
        id: 'route-line-schematic', type: 'line', source: 'route-line',
        filter: ['==', ['get', 'recorded'], false],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': lineColor, 'line-width': 3, 'line-opacity': 0.75, 'line-dasharray': [2, 2] },
      });

      fitCoordinates(map, coordinates);
    };

    if (map.isStyleLoaded()) {
      drawRoute();
      return;
    }

    map.once('load', drawRoute);
    return () => {
      map.off('load', drawRoute);
    };
  }, [activeRoute, carParks, destination, origin, themeMode, mapAttempt]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    const element = document.createElement('div');
    element.className = 'user-marker';

    const pulse = document.createElement('div');
    pulse.className = 'pulse';
    element.appendChild(pulse);

    const core = document.createElement('div');
    core.className = 'core';
    element.appendChild(core);

    const marker = new maplibregl.Marker({ element, anchor: 'center' })
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .setPopup(
        new maplibregl.Popup({ offset: 20 }).setText(
          userLocation.accuracy > 500
            ? `Your location (approx. ±${Math.round(userLocation.accuracy)}m)`
            : 'Your location',
        ),
      )
      .addTo(map);

    locationMarkerRef.current?.remove();
    locationMarkerRef.current = marker;
    return () => {
      marker.remove();
      if (locationMarkerRef.current === marker) locationMarkerRef.current = null;
    };
  }, [userLocation, mapAttempt]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusedLocation) return;

    map.flyTo({
      center: [focusedLocation.longitude, focusedLocation.latitude],
      zoom: 14,
      duration: 1200,
    });
  }, [focusedLocation, mapAttempt]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  const handleFitRoute = () => {
    const map = mapRef.current;
    if (!map || !origin || !destination) return;

    const coordinates = routeMapSegments(activeRoute).flatMap((segment) => segment.coordinates);
    fitCoordinates(map, coordinates.length ? coordinates : [[origin.longitude, origin.latitude], [destination.longitude, destination.latitude]]);
  };

  const handleRecenterUser = () => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 14,
      duration: 700,
    });
  };

  return (
    <div className="map-panel">
      {mapError && <div className="map-error-notice" role="status"><p>{mapError}</p><button type="button" onClick={() => setMapAttempt((attempt) => attempt + 1)}>Retry map</button></div>}
      <div className="map-controls-overlay" aria-label="Map controls">
        <button className="map-control-btn" onClick={handleZoomIn} title="Zoom in" aria-label="Zoom in">
          <ZoomIn size={22} />
        </button>
        <button className="map-control-btn" onClick={handleZoomOut} title="Zoom out" aria-label="Zoom out">
          <ZoomOut size={22} />
        </button>
        <button className="map-control-btn" onClick={handleFitRoute} title="Fit selected route" aria-label="Fit selected route">
          <Scan size={21} />
        </button>
        {userLocation && (
          <button className="map-control-btn" onClick={handleRecenterUser} title="Center on my location" aria-label="Center on my location">
            <LocateFixed size={21} />
          </button>
        )}
      </div>

      <details className="map-legend" aria-label="Map key" open={legendOpen}
        onToggle={(event) => setLegendOpen(event.currentTarget.open)}>
        <summary>Map key <ChevronDown size={18} /></summary>
        <div className="map-legend-items">
        <strong>Sample stop locations</strong>
        <span><i className="map-key-dot origin">A</i> Origin</span>
        <span><i className="map-key-dot destination">B</i> Destination</span>
        {activeRoute?.transferPoints.length ? <span><i className="map-key-dot transfer">T</i> Transfer</span> : null}
        <span><i className="map-key-dot park" /> Other car parks</span>
        {userLocation && <span><i className="map-key-dot current" /> Your location</span>}
        {mapSegments.some((segment) => !segment.recorded) && <span><i className="map-path-key" /> Schematic connection</span>}
        {mapSegments.some((segment) => segment.recorded) && <span><i className="map-path-key recorded" /> Recorded path</span>}
        </div>
      </details>

      <div className="map-container" ref={mapContainer} />
    </div>
  );
}
