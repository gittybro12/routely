import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Map from './Map';
import { carParks, findRoutePath, searchParks, getAssistantResponse } from './data';
import type { RoutePath } from './types';

type UserLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

function App() {
  const [originId, setOriginId] = useState(carParks[0].id);
  const [destinationId, setDestinationId] = useState(carParks[1].id);
  const [parkFilter, setParkFilter] = useState('');
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState('Ask about direct routes, transfers, or park names.');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'unknown' | 'searching' | 'granted' | 'denied' | 'unavailable'>('unknown');

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }

    const onPosition = (position: GeolocationPosition) => {
      const nextLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? 0,
      };

      setUserLocation((previous) => {
        if (!previous) return nextLocation;
        if (nextLocation.accuracy < previous.accuracy) return nextLocation;
        return previous;
      });
      setLocationStatus('granted');
    };

    const onError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setLocationStatus('denied');
        return;
      }

      if (error.code === error.POSITION_UNAVAILABLE) {
        setLocationStatus('unavailable');
        return;
      }

      setLocationStatus('denied');
    };

    setLocationStatus('searching');
    const watchId = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const filteredParks = useMemo(() => searchParks(parkFilter), [parkFilter]);

  const origin = useMemo(() => carParks.find((park) => park.id === originId), [originId]);
  const destination = useMemo(
    () => carParks.find((park) => park.id === destinationId),
    [destinationId],
  );

  const route = useMemo<RoutePath | null>(() => findRoutePath(originId, destinationId), [originId, destinationId]);

  const handleAsk = () => {
    setAssistantAnswer(getAssistantResponse(assistantQuery, route, originId, destinationId));
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }

    setLocationStatus('searching');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? 0,
        };

        setUserLocation((previous) => {
          if (!previous) return nextLocation;
          if (nextLocation.accuracy < previous.accuracy) return nextLocation;
          return previous;
        });
        setLocationStatus('granted');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('denied');
          return;
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationStatus('unavailable');
          return;
        }

        setLocationStatus('denied');
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
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);
  }, [userLocation]);

  const handleFindNearestPark = () => {
    if (!userLocation) return;

    const nearest = nearbyParks[0];
    if (nearest) {
      setOriginId(nearest.id);
      setDestinationId(nearest.id);
      setAssistantAnswer(`Nearest park set to ${nearest.name}.`);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="eyebrow">Abuja along route planner</span>
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 700 }}>
            Routely Abuja
          </Typography>
          <Typography color="text.secondary">
            Find the best public car route between major Abuja car parks and see your next transfer at a glance.
          </Typography>
        </div>

        <Paper className="location-panel" elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(240,253,250,0.95)', border: '1px solid rgba(45,212,191,0.2)' }}>
          <div>
            <span className="eyebrow">Location access</span>
            <Typography variant="body2" className="location-status">
              {locationStatus === 'unknown' && 'Requesting location permission...'}
              {locationStatus === 'searching' && 'Finding a more precise location...'}
              {locationStatus === 'granted' &&
                (userLocation && userLocation.accuracy > 500
                  ? `Approximate location shown (±${Math.round(userLocation.accuracy)}m).`
                  : 'Location access granted. Your position is shown on the map.')}
              {locationStatus === 'denied' &&
                'Location access denied. Enable location permissions to show your position on the map.'}
              {locationStatus === 'unavailable' && 'Geolocation is unavailable in this browser.'}
            </Typography>
          </div>
          <Stack spacing={1.2}>
            <Button variant="contained" onClick={handleUseLocation}>
              Use my location
            </Button>
            <Button variant="contained" color="secondary" onClick={handleFindNearestPark} disabled={!userLocation}>
              Find nearest park
            </Button>
          </Stack>
        </Paper>

        {nearbyParks.length > 0 && (
          <Card className="nearby-card" variant="outlined" sx={{ mb: 2, borderRadius: 3, boxShadow: 'none' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Nearby parks
              </Typography>
              <Stack spacing={1}>
                {nearbyParks.map((park) => (
                  <div key={park.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <strong>{park.name}</strong>
                    <span>{park.zone}</span>
                  </div>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        <Autocomplete
          freeSolo
          options={filteredParks}
          getOptionLabel={(park) => park.name}
          inputValue={parkFilter}
          onInputChange={(_, value) => setParkFilter(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search car parks"
              placeholder="Search Wuse, Garki, Jabi, Life Camp, Kubwa..."
              fullWidth
              sx={{ mb: 2 }}
            />
          )}
        />

        <div className="selection-grid">
          <FormControl fullWidth>
            <InputLabel id="origin-label">Origin car park</InputLabel>
            <Select
              labelId="origin-label"
              label="Origin car park"
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
            >
              {filteredParks.map((park) => (
                <MenuItem key={park.id} value={park.id}>
                  {park.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="destination-label">Destination car park</InputLabel>
            <Select
              labelId="destination-label"
              label="Destination car park"
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
            >
              {filteredParks.map((park) => (
                <MenuItem key={park.id} value={park.id}>
                  {park.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <Card className="route-card" variant="outlined" sx={{ mt: 2, borderRadius: 4, boxShadow: 'none' }}>
          <CardContent>
            <div className="route-card-header">
              <Typography variant="h6">Route preview</Typography>
              <span className="route-tag">{route ? `${route.legs.length + 1} leg route` : 'No route yet'}</span>
            </div>

            {route ? (
              <>
                <div className="route-meta">
                  <Chip label={`From: ${origin?.name}`} />
                  <Chip label={`To: ${destination?.name}`} />
                </div>

                <ol className="route-steps">
                  {route.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>

                <p className="route-transfer">
                  Transfer points: <strong>{route.transferPoints.join(', ') || 'None'}</strong>
                </p>
              </>
            ) : (
              <p className="no-route">No route found. Try a different origin or destination.</p>
            )}
          </CardContent>
        </Card>

        <Card className="assistant-card" variant="outlined" sx={{ mt: 2, borderRadius: 4, boxShadow: 'none' }}>
          <CardContent>
            <div className="route-card-header">
              <Typography variant="h6">Route assistant</Typography>
              <span className="route-tag">AI-style helper</span>
            </div>
            <TextField
              fullWidth
              multiline
              minRows={4}
              value={assistantQuery}
              onChange={(e) => setAssistantQuery(e.target.value)}
              placeholder="Ask something like: direct route, next transfer, fastest path"
              sx={{ mb: 1.5 }}
            />
            <Button fullWidth variant="contained" onClick={handleAsk} disabled={!assistantQuery.trim()}>
              Ask Routely
            </Button>
            <p className="assistant-answer">{assistantAnswer}</p>
          </CardContent>
        </Card>
      </aside>

      <main className="map-panel">
        <Map
          carParks={carParks}
          activeRoute={route}
          origin={origin}
          destination={destination}
          userLocation={userLocation}
        />
      </main>
    </div>
  );
}

export default App;
