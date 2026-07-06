import { describe, expect, it } from 'vitest';
import { getAssistantResponse, findRoutePath, carParks } from './data';

describe('getAssistantResponse', () => {
  it('returns a route-specific answer for a direct route query', () => {
    const route = findRoutePath('wuse2', 'garki');
    const response = getAssistantResponse('direct route', route, 'wuse2', 'garki');

    expect(response).toContain('direct');
    expect(response).toContain('Wuse 2 Car Park');
    expect(response).toContain('Garki Car Park');
  });

  it('returns a transfer-focused answer for a transfer query', () => {
    const route = findRoutePath('wuse2', 'life-camp');
    const response = getAssistantResponse('next transfer', route, 'wuse2', 'life-camp');

    expect(response).toContain('next step');
    expect(response).toContain('Life Camp');
  });

  it('uses the selected path instead of the same generic fallback', () => {
    const route = findRoutePath('wuse2', 'jabi');
    const response = getAssistantResponse('how do I go', route, 'wuse2', 'jabi');

    expect(response).toContain('Take an along');
    expect(response).toContain('Jabi Car Park');
  });
});
