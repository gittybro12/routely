import { carParks, findRoutePath, getParkById } from './data';
import type { CarPark, Coordinate, RouteLeg, RoutePath } from './types';

export const PILOT_JOURNEYS = [
  { from: 'wuse2', to: 'jabi' },
  { from: 'wuse2', to: 'garki' },
  { from: 'jabi', to: 'utako' },
  { from: 'wuse1', to: 'berger' },
  { from: 'berger', to: 'kubwa' },
  { from: 'gwarinpa', to: 'kubwa' },
  { from: 'area1', to: 'lugbe' },
  { from: 'lugbe', to: 'airport' },
  { from: 'asokoro', to: 'nyanya' },
  { from: 'nyanya', to: 'karu' },
] as const;

export function shortStopName(park: CarPark | undefined) {
  return park?.name.replace(' Car Park', '') || 'Choose a stop';
}

export function isConnectionVerified(leg: RouteLeg, today = new Date()) {
  const evidence = leg.verification;
  if (evidence?.status !== 'verified' || !evidence.source?.trim() || !evidence.checkedBy?.trim()) return false;
  if (!leg.boardingLandmark?.trim() || !leg.alightingLandmark?.trim()) return false;
  if (!leg.transportMode || leg.transportMode === 'unknown') return false;
  const checkedAt = evidence.checkedAt || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkedAt)) return false;
  const checked = new Date(checkedAt + 'T00:00:00Z');
  if (!Number.isFinite(checked.getTime()) || checked.toISOString().slice(0, 10) !== checkedAt) return false;
  const dateInLagos = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit' }).format(today);
  return checkedAt <= dateInLagos;
}

export function journeyStatus(route: RoutePath | null) {
  const verified = route?.legs.filter((leg) => isConnectionVerified(leg)).length || 0;
  const total = route?.legs.length || 0;
  return { verified, total, isVerified: total > 0 && verified === total };
}

export function recordedGeometry(leg: RouteLeg): Coordinate[] | null {
  if (!leg.geometrySource?.trim() || !Array.isArray(leg.geometry) || leg.geometry.length < 2) return null;
  const valid = leg.geometry.every((point) => Array.isArray(point) && point.length === 2 &&
    Number.isFinite(point[0]) && Number.isFinite(point[1]) && Math.abs(point[0]) <= 180 && Math.abs(point[1]) <= 90);
  if (!valid) return null;
  const from = getParkById(leg.from);
  const to = getParkById(leg.to);
  if (!from || !to) return null;
  const first = leg.geometry[0];
  const last = leg.geometry[leg.geometry.length - 1];
  // A recorded path must run in this connection's direction, near both stop pins.
  if (distanceKm(from, { longitude: first[0], latitude: first[1] }) > 1 ||
      distanceKm(to, { longitude: last[0], latitude: last[1] }) > 1) return null;
  return leg.geometry;
}

export function routeMapSegments(route: RoutePath | null) {
  return (route?.legs || []).flatMap((leg) => {
    const from = getParkById(leg.from);
    const to = getParkById(leg.to);
    if (!from || !to) return [];
    const geometry = recordedGeometry(leg);
    return [{
      recorded: Boolean(geometry),
      coordinates: geometry || [[from.longitude, from.latitude], [to.longitude, to.latitude]] as Coordinate[],
    }];
  });
}

export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}

export function nearestStops(location: { latitude: number; longitude: number }) {
  return carParks.map((park) => ({ ...park, distanceKm: distanceKm(location, park) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function transportLabel(leg: RouteLeg) {
  const modes = { 'shared-taxi': 'Shared taxi', bus: 'Bus', shuttle: 'Shuttle', unknown: 'Transport type needs checking' };
  return modes[leg.transportMode || 'unknown'];
}

export function readJourneySelection(search: string) {
  const params = new URLSearchParams(search);
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const valid = Boolean(getParkById(from) && getParkById(to) && from !== to);
  return { from: getParkById(from) ? from : '', to: getParkById(to) ? to : '', valid,
    invalidLink: Boolean((params.has('from') || params.has('to')) && !valid) };
}

export function journeyUrl(from: string, to: string) {
  return '/planner?' + new URLSearchParams({ from, to }).toString();
}

export function journeyText(fromId: string, toId: string) {
  const route = findRoutePath(fromId, toId);
  if (!route) return 'No mapped journey is available.';
  const status = journeyStatus(route);
  const lines = [
    'ROUTELY — ABUJA JOURNEY',
    shortStopName(getParkById(fromId)) + ' → ' + shortStopName(getParkById(toId)),
    status.isVerified ? 'Field-checked connections. Check the dates below.' : 'SAMPLE JOURNEY — connections and boarding points need local checking.',
    'Selected by fewest mapped rides. Fares, journey times, and live service are unavailable.', '',
  ];
  route.legs.forEach((leg, index) => {
    lines.push(`${index + 1}. ${shortStopName(getParkById(leg.from))} → ${shortStopName(getParkById(leg.to))}`,
      'Transport: ' + transportLabel(leg),
      'Board: ' + (leg.boardingLandmark || 'Exact boarding point has not been checked.'),
      'Instruction: ' + leg.instruction,
      'Alight: ' + (leg.alightingLandmark || 'Exact alighting point has not been checked.'),
      'Status: ' + (isConnectionVerified(leg) ? 'Field-checked on ' + leg.verification!.checkedAt + ' · Source: ' + leg.verification!.source : 'Sample / needs checking'),
      ...(leg.serviceNotes ? ['Service notes: ' + leg.serviceNotes] : []), '');
  });
  lines.push('Arrive at ' + shortStopName(getParkById(toId)) + '.', 'Downloaded ' + new Date().toISOString());
  return lines.join('\n');
}

export function pilotSurveyTemplate() {
  return PILOT_JOURNEYS.map(({ from, to }) => ({ from, to,
    fromName: getParkById(from)?.name, toName: getParkById(to)?.name,
    transportMode: 'unknown', boardingLandmark: '', alightingLandmark: '', instruction: '', serviceNotes: '',
    verification: { status: 'sample', checkedAt: '', checkedBy: '', source: '' },
    geometry: [], geometrySource: '',
  }));
}

export function downloadText(filename: string, content: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
