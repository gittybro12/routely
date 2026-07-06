import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { CarPark, RoutePath } from './types';

interface MapProps {
  carParks: CarPark[];
  activeRoute: RoutePath | null;
  origin: CarPark | undefined;
  destination: CarPark | undefined;
  userLocation: { latitude: number; longitude: number; accuracy: number } | null;
}

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

export default function Map({ carParks, activeRoute, origin, destination, userLocation }: MapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const locationMarkerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: defaultStyle,
      center: defaultCenter,
      zoom: 10,
    });

    mapRef.current = map;

    map.on('load', () => {
      carParks.forEach((park) => {
        new maplibregl.Marker({ color: park.id === origin?.id ? '#1f8ef1' : '#db3b21' })
          .setLngLat([park.longitude, park.latitude])
          .setPopup(new maplibregl.Popup({ offset: 20 }).setText(`${park.name} — ${park.zone}`))
          .addTo(map);
      });
    });

    return () => {
      locationMarkerRef.current?.remove();
      map.remove();
    };
  }, [carParks, origin]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeRoute || !origin || !destination) return;

    const drawRoute = () => {
      const coordinates = [
        [origin.longitude, origin.latitude],
        ...activeRoute.transferPoints.map((point: string) => {
          const match = carParks.find((park) => park.name === point);
          return match ? [match.longitude, match.latitude] : [origin.longitude, origin.latitude];
        }),
        [destination.longitude, destination.latitude],
      ];

      if (map.getSource('route-line')) {
        map.removeLayer('route-line');
        map.removeSource('route-line');
      }

      map.addSource('route-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-line',
        paint: {
          'line-color': '#1f8ef1',
          'line-width': 4,
        },
      });

      const bounds = coordinates.length === 2 ? [coordinates[0], coordinates[1]] : [coordinates[0], coordinates[coordinates.length - 1]];
      map.fitBounds(bounds as [[number, number], [number, number]], { padding: 80 });
    };

    if (!map.isStyleLoaded()) {
      map.once('load', drawRoute);
      return;
    }

    drawRoute();
  }, [activeRoute, carParks, origin, destination]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    // create a DOM element for a pulsing user marker
    const el = document.createElement('div');
    el.className = 'user-marker';
    const pulse = document.createElement('div');
    pulse.className = 'pulse';
    el.appendChild(pulse);

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .setPopup(
        new maplibregl.Popup({ offset: 20 }).setText(
          userLocation.accuracy > 500
            ? `Your current location (approx. ±${Math.round(userLocation.accuracy)}m)`
            : 'Your current location',
        ),
      )
      .addTo(map);

    locationMarkerRef.current?.remove();
    locationMarkerRef.current = marker;

    // ensure the marker is visible by panning the map gently
    try {
      map.panTo([userLocation.longitude, userLocation.latitude]);
    } catch (e) {
      // ignore pan errors
    }

    return () => {
      marker.remove();
    };
  }, [userLocation, activeRoute]);

  return <div className="map-container" ref={mapContainer} />;
}
