import { describe, expect, it } from 'vitest';
import { carParks, searchParks } from './data';
import { emptyJourneyLibrary, MAX_RECENT_JOURNEYS, MAX_SAVED_JOURNEYS, parseJourneyLibrary, recordRecentJourney, toggleSavedJourney } from './journeyLibrary';

const now = new Date('2026-10-20T12:00:00Z');

describe('planner stop search', () => {
  it('finds local aliases, area names, Roman numerals and joined or accented spellings', () => {
    for (const [query, id] of [
      ['Banex', 'wuse2'], ['WÚSE TWO', 'wuse2'], ['WuseII', 'wuse2'],
      ['Wuse market', 'wuse1'], ['AYA', 'asokoro'], ['Gudu', 'apo'],
      ['Central Business District', 'cbd'], ['AbujaCBD', 'cbd'],
      ['N.A.I.A', 'airport'], ['lifecamp', 'life-camp'], ['Life-Camp', 'life-camp'],
    ]) expect(searchParks(query)[0]?.id, query).toBe(id);
  });

  it('tolerates one small typing mistake without guessing numbered areas or unrelated places', () => {
    for (const query of ['gwarimpa', 'gwarinap', 'gwaripa']) expect(searchParks(query)[0]?.id).toBe('gwarinpa');
    expect(searchParks('wuze 2').map((stop) => stop.id)).toEqual(['wuse2']);
    for (const query of ['wuse 9', 'airport road', 'zzzzzzzz', 'jbi', '???']) expect(searchParks(query), query).toEqual([]);
  });

  it('retains all options for an empty query and respects the caller’s available stops', () => {
    expect(searchParks('  ').map((stop) => stop.id)).toEqual(carParks.map((stop) => stop.id));
    const subset = carParks.filter((stop) => stop.id === 'kubwa');
    expect(searchParks('Banex', subset)).toEqual([]);
    expect(searchParks('kub', subset)).toEqual(subset);
  });
});

describe('saved journeys and recent searches', () => {
  it('moves a repeated search to the front, keeps direction, and limits recent history', () => {
    let library = emptyJourneyLibrary();
    for (const [index, to] of ['jabi', 'utako', 'garki', 'berger', 'kado', 'cbd'].entries()) {
      library = recordRecentJourney(library, 'wuse2', to, new Date(now.getTime() + index));
    }
    expect(library.recent).toHaveLength(MAX_RECENT_JOURNEYS);
    expect(library.recent[0].to).toBe('cbd');
    expect(library.recent.some((trip) => trip.to === 'jabi')).toBe(false);
    library = recordRecentJourney(library, 'wuse2', 'utako', new Date(now.getTime() + 20));
    expect(library.recent[0].to).toBe('utako');
    expect(library.recent.filter((trip) => trip.to === 'utako')).toHaveLength(1);
    library = recordRecentJourney(library, 'utako', 'wuse2', new Date(now.getTime() + 30));
    expect(library.recent.slice(0, 2).map(({ from, to }) => [from, to])).toEqual([['utako', 'wuse2'], ['wuse2', 'utako']]);
  });

  it('saves each direction independently and removing a favourite preserves recent history', () => {
    let library = recordRecentJourney(emptyJourneyLibrary(), 'wuse2', 'jabi', now);
    library = toggleSavedJourney(library, 'wuse2', 'jabi', now).library;
    library = toggleSavedJourney(library, 'jabi', 'wuse2', now).library;
    expect(library.saved).toHaveLength(2);
    const result = toggleSavedJourney(library, 'wuse2', 'jabi', now);
    expect(result.action).toBe('removed');
    expect(result.library.saved.map(({ from, to }) => [from, to])).toEqual([['jabi', 'wuse2']]);
    expect(result.library.recent).toEqual(library.recent);
  });

  it('rejects invalid endpoints and never silently evicts a saved journey at the limit', () => {
    let library = emptyJourneyLibrary();
    for (const [from, to] of [['unknown', 'jabi'], ['wuse2', 'unknown'], ['jabi', 'jabi']]) {
      expect(recordRecentJourney(library, from, to, now)).toBe(library);
      expect(toggleSavedJourney(library, from, to, now).action).toBe('invalid');
    }
    for (const stop of carParks.filter((park) => park.id !== 'wuse2')) {
      library = toggleSavedJourney(library, 'wuse2', stop.id, now).library;
    }
    expect(library.saved).toHaveLength(MAX_SAVED_JOURNEYS);
    expect(toggleSavedJourney(library, 'jabi', 'wuse2', now)).toEqual({ library, action: 'limit' });
    const removed = toggleSavedJourney(library, 'wuse2', 'jabi', now);
    expect(removed.action).toBe('removed');
    expect(removed.library.saved).toHaveLength(MAX_SAVED_JOURNEYS - 1);
  });

  it('restores only valid, unique stop pairs and discards stale or forged route details', () => {
    const trip = { from: 'wuse2', to: 'jabi', recordedAt: now.toISOString() };
    const raw = JSON.stringify({ version: 1, saved: [
      { ...trip, recordedAt: '2026-10-19T10:00:00Z' }, null,
      { ...trip, from: 'removed-stop' }, { ...trip, to: 'wuse2' },
      { ...trip, recordedAt: 'not-a-date' },
      { ...trip, status: 'verified', instruction: 'Stale instructions', latitude: 1 },
    ], recent: [trip] });
    expect(parseJourneyLibrary(raw)).toEqual({ version: 1, saved: [trip], recent: [trip] });
    for (const broken of [null, '{broken', 'null', '[]', '{}', '{"version":2,"saved":[]}']) {
      expect(parseJourneyLibrary(broken)).toEqual(emptyJourneyLibrary());
    }
  });
});
