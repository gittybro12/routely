import { describe, expect, it } from 'vitest';
import { carParks, findRoutePath, getParkById, routeDefinitions } from './data';
import { distanceKm, isConnectionVerified, journeyStatus, journeyText, journeyUrl, nearestStops, PILOT_JOURNEYS, readJourneySelection, recordedGeometry, routeMapSegments } from './journey';
import { parseReports } from './reports';
import type { RouteLeg } from './types';

const today = new Date('2026-10-19T10:00:00Z');
const checkedLeg: RouteLeg = {
  from: 'wuse2', to: 'jabi', instruction: 'Test observation only', transportMode: 'shared-taxi',
  boardingLandmark: 'Test boarding landmark', alightingLandmark: 'Test alighting landmark',
  verification: { status: 'verified', source: 'Test field record', checkedBy: 'Test observer', checkedAt: '2026-10-18' },
};

describe('journey data integrity', () => {
  it('rejects unknown stops, including an unknown same-stop pair', () => {
    expect(findRoutePath('unknown', 'unknown')).toBeNull();
    expect(findRoutePath('wuse2', 'unknown')).toBeNull();
    expect(findRoutePath(undefined, 'jabi')).toBeNull();
  });
  it('keeps all ten collection targets available without claiming field verification', () => {
    expect(PILOT_JOURNEYS).toHaveLength(10);
    for (const { from, to } of PILOT_JOURNEYS) {
      const route = findRoutePath(from, to);
      expect(route?.legs).toHaveLength(1);
      expect(journeyStatus(route).isVerified).toBe(false);
      expect(route?.legs[0].verification?.status).toBe('sample');
    }
  });
  it('returns the minimum ride count for every mapped pair, with connected, ordered legs', () => {
    // Independent all-pairs distance matrix checks the route search's public behavior.
    const ids = carParks.map((park) => park.id);
    const distances = ids.map((from) => ids.map((to) => from === to ? 0 : routeDefinitions.some((edge) => edge.from === from && edge.to === to) ? 1 : Infinity));
    for (let k = 0; k < ids.length; k++) for (let i = 0; i < ids.length; i++) for (let j = 0; j < ids.length; j++) distances[i][j] = Math.min(distances[i][j], distances[i][k] + distances[k][j]);
    ids.forEach((from, i) => ids.forEach((to, j) => {
      const route = findRoutePath(from, to);
      expect(route?.legs.length ?? Infinity).toBe(distances[i][j]);
      route?.legs.forEach((leg, index) => {
        expect(leg.from).toBe(index === 0 ? from : route.legs[index - 1].to);
        if (index === route.legs.length - 1) expect(leg.to).toBe(to);
      });
    }));
  });
  it('does not inherit evidence into an assumed reverse connection', () => {
    const forward = routeDefinitions.find((edge) => edge.from === 'lugbe' && edge.to === 'airport')!;
    const reverse = routeDefinitions.find((edge) => edge.from === 'airport' && edge.to === 'lugbe')!;
    expect(reverse.verification?.status).toBe('sample');
    expect(reverse.geometry).toBeUndefined();
    expect(reverse.verification).not.toBe(forward.verification);
  });
});

describe('field-check evidence', () => {
  it('requires direction-specific landmarks, a known mode, observer, source and a real non-future date', () => {
    expect(isConnectionVerified(checkedLeg, today)).toBe(true);
    for (const leg of [
      { ...checkedLeg, boardingLandmark: '' },
      { ...checkedLeg, alightingLandmark: '' },
      { ...checkedLeg, transportMode: 'unknown' as const },
      { ...checkedLeg, verification: { ...checkedLeg.verification!, source: '' } },
      { ...checkedLeg, verification: { ...checkedLeg.verification!, checkedBy: '' } },
      { ...checkedLeg, verification: { ...checkedLeg.verification!, checkedAt: '2026-02-30' } },
      { ...checkedLeg, verification: { ...checkedLeg.verification!, checkedAt: '2026-10-20' } },
      { ...checkedLeg, verification: { ...checkedLeg.verification!, status: 'sample' as const } },
    ]) expect(isConnectionVerified(leg, today)).toBe(false);
  });
});

describe('map paths and nearby stops', () => {
  const from = getParkById('wuse2')!;
  const to = getParkById('jabi')!;
  const geometry: [number, number][] = [[from.longitude, from.latitude], [7.45, 9.075], [to.longitude, to.latitude]];
  it('distinguishes recorded travel paths from schematic stop connections', () => {
    expect(recordedGeometry({ ...checkedLeg, geometry, geometrySource: 'Test recorded path' })).toEqual(geometry);
    expect(recordedGeometry({ ...checkedLeg, geometry })).toBeNull();
    expect(recordedGeometry({ ...checkedLeg, geometry: [...geometry].reverse(), geometrySource: 'Wrong direction' })).toBeNull();
    expect(recordedGeometry({ ...checkedLeg, geometry: [[NaN, 9], [7, 9]], geometrySource: 'Invalid' })).toBeNull();
    const segments = routeMapSegments(findRoutePath('wuse2', 'airport'));
    expect(segments.length).toBeGreaterThan(1);
    expect(segments.every((segment) => !segment.recorded && segment.coordinates.length === 2)).toBe(true);
  });
  it('uses geographic distance and keeps a stop at its own location first', () => {
    expect(distanceKm(from, from)).toBe(0);
    expect(distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 })).toBeCloseTo(111.195, 2);
    expect(nearestStops(from)[0].id).toBe(from.id);
    expect(nearestStops({ latitude: 6.5, longitude: 3.4 })[0].distanceKm).toBeGreaterThan(30);
  });
});

describe('shared and downloaded journeys', () => {
  it('round-trips supported endpoints and rejects incomplete or unsupported links', () => {
    const url = journeyUrl('life-camp', 'airport');
    expect(readJourneySelection(url.slice(url.indexOf('?')))).toMatchObject({ from: 'life-camp', to: 'airport', valid: true });
    for (const search of ['?from=invalid&to=jabi', '?from=wuse2', '?from=jabi&to=jabi']) expect(readJourneySelection(search)).toMatchObject({ valid: false, invalidLink: true });
    expect(readJourneySelection('')).toMatchObject({ valid: false, invalidLink: false });
  });
  it('keeps the sample status and missing boarding details in downloaded steps', () => {
    const text = journeyText('wuse2', 'jabi');
    expect(text).toContain('SAMPLE JOURNEY');
    expect(text).toContain('Exact boarding point has not been checked');
    expect(text).toContain('Wuse 2');
    expect(text).toContain('Jabi');
    expect(text).toContain('Fares, journey times, and live service are unavailable');
  });
});

describe('local correction reports', () => {
  it('handles corrupt storage and keeps reports pending without accepting verified entries', () => {
    expect(parseReports('{broken')).toEqual([]);
    expect(parseReports('{}')).toEqual([]);
    const report = { id: 'test', createdAt: '2026-10-19T10:00:00Z', status: 'pending-review', from: 'wuse2', to: 'jabi', category: 'boarding', description: 'Test observation' };
    expect(parseReports(JSON.stringify([report, null, { ...report, status: 'verified' }]))).toEqual([report]);
  });
});
