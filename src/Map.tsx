import { useCallback, useEffect, useRef } from 'react';
import { LocateFixed, Scan, ZoomIn, ZoomOut } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { CarPark, RoutePath } from './types';

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

const defaultStyle = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-raster',
      type: 'raster' as const,
      source: 'osm',
    },
  ],
};

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

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: defaultStyle,
      center: defaultCenter,
      zoom: 11,
      attributionControl: { compact: true },
    });

    mapRef.current = map;

    return () => {
      locationMarkerRef.current?.remove();
      parkMarkersRef.current.forEach((marker) => marker.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

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
  }, [renderParkMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const drawRoute = () => {
      ['route-line-halo', 'route-line-outline', 'route-line'].forEach((layerId) => {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
      });
      if (map.getSource('route-line')) map.removeSource('route-line');
      if (!activeRoute || !origin || !destination) return;

      const coordinates: [number, number][] = [
        [origin.longitude, origin.latitude],
        ...activeRoute.transferPoints.flatMap((name) => {
          const park = carParks.find((item) => item.name === name);
          return park ? [[park.longitude, park.latitude] as [number, number]] : [];
        }),
        [destination.longitude, destination.latitude],
      ];

      map.addSource('route-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates },
        },
      });

      const lineColor = themeMode === 'dark' ? '#38bdf8' : '#0284c7';
      const lineOutline = themeMode === 'dark' ? '#0b0f19' : '#ffffff';

      map.addLayer({
        id: 'route-line-halo',
        type: 'line',
        source: 'route-line',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': lineColor, 'line-width': 15, 'line-opacity': 0.22, 'line-blur': 2 },
      });
      map.addLayer({
        id: 'route-line-outline',
        type: 'line',
        source: 'route-line',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': lineOutline, 'line-width': 10, 'line-opacity': 0.96 },
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-line',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': lineColor, 'line-width': 5 },
      });

      const bounds = new maplibregl.LngLatBounds();
      coordinates.forEach((coordinate) => bounds.extend(coordinate));
      map.fitBounds(bounds, {
        padding: { top: 100, right: 100, bottom: 110, left: 100 },
        maxZoom: 14,
        duration: 700,
      });
    };

    if (map.isStyleLoaded()) {
      drawRoute();
      return;
    }

    map.once('load', drawRoute);
    return () => {
      map.off('load', drawRoute);
    };
  }, [activeRoute, carParks, destination, origin, themeMode]);

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
  }, [userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusedLocation) return;

    map.flyTo({
      center: [focusedLocation.longitude, focusedLocation.latitude],
      zoom: 14,
      duration: 1200,
    });
  }, [focusedLocation]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  const handleFitRoute = () => {
    const map = mapRef.current;
    if (!map || !origin || !destination) return;

    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([origin.longitude, origin.latitude]);
    bounds.extend([destination.longitude, destination.latitude]);
    activeRoute?.transferPoints.forEach((name) => {
      const park = carParks.find((item) => item.name === name);
      if (park) bounds.extend([park.longitude, park.latitude]);
    });
    map.fitBounds(bounds, {
      padding: { top: 100, right: 100, bottom: 110, left: 100 },
      maxZoom: 14,
      duration: 700,
    });
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

      <div className="map-legend" aria-label="Map key">
        <strong>Map key</strong>
        <span><i className="map-key-dot origin">A</i> Origin</span>
        <span><i className="map-key-dot destination">B</i> Destination</span>
        {activeRoute?.transferPoints.length ? <span><i className="map-key-dot transfer">T</i> Transfer</span> : null}
        <span><i className="map-key-dot park" /> Other car parks</span>
        {userLocation && <span><i className="map-key-dot current" /> Your location</span>}
      </div>

      <div className="map-container" ref={mapContainer} />
    </div>
  );
}
