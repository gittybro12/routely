import type { CarPark, RouteDefinition, RoutePath, RouteLeg } from './types';

export const carParks: CarPark[] = [
  {
    id: 'wuse2',
    name: 'Wuse 2 Car Park',
    zone: 'Wuse',
    latitude: 9.0709,
    longitude: 7.4904,
  },
  {
    id: 'wuse1',
    name: 'Wuse 1 Car Park',
    zone: 'Wuse',
    latitude: 9.0618,
    longitude: 7.4909,
  },
  {
    id: 'wuse3',
    name: 'Wuse 3 Car Park',
    zone: 'Wuse',
    latitude: 9.0774,
    longitude: 7.4804,
  },
  {
    id: 'jabi',
    name: 'Jabi Car Park',
    zone: 'Jabi',
    latitude: 9.0535,
    longitude: 7.5078,
  },
  {
    id: 'garki',
    name: 'Garki Car Park',
    zone: 'Garki',
    latitude: 9.0739,
    longitude: 7.4783,
  },
  {
    id: 'life-camp',
    name: 'Life Camp Car Park',
    zone: 'Life Camp',
    latitude: 9.1128,
    longitude: 7.4791,
  },
  {
    id: 'utako',
    name: 'Utako Car Park',
    zone: 'Utako',
    latitude: 9.0624,
    longitude: 7.4690,
  },
  {
    id: 'asokoro',
    name: 'Asokoro Car Park',
    zone: 'Asokoro',
    latitude: 9.0004,
    longitude: 7.4802,
  },
  {
    id: 'maitama',
    name: 'Maitama Car Park',
    zone: 'Maitama',
    latitude: 9.0894,
    longitude: 7.5010,
  },
  {
    id: 'cbd',
    name: 'CBD Car Park',
    zone: 'Abuja CBD',
    latitude: 9.0666,
    longitude: 7.4927,
  },
  {
    id: 'area1',
    name: 'Area 1 Transport Hub',
    zone: 'Area 1',
    latitude: 9.0547,
    longitude: 7.4801,
  },
  {
    id: 'berger',
    name: 'Berger Transport Hub',
    zone: 'Berger',
    latitude: 9.0555,
    longitude: 7.4260,
  },
  {
    id: 'gwarinpa',
    name: 'Gwarinpa Car Park',
    zone: 'Gwarinpa',
    latitude: 9.1424,
    longitude: 7.4057,
  },
  {
    id: 'kado',
    name: 'Kado Car Park',
    zone: 'Kado',
    latitude: 9.0813,
    longitude: 7.4744,
  },
  {
    id: 'apo',
    name: 'Apo Car Park',
    zone: 'Apo',
    latitude: 8.9812,
    longitude: 7.4963,
  },
  {
    id: 'nyanya',
    name: 'Nyanya Park',
    zone: 'Nyanya',
    latitude: 9.0284,
    longitude: 7.5872,
  },
  {
    id: 'karu',
    name: 'Karu Bus Park',
    zone: 'Karu',
    latitude: 9.0244,
    longitude: 7.5833,
  },
  {
    id: 'airport',
    name: 'Abuja Airport Car Park',
    zone: 'Airport',
    latitude: 9.0068,
    longitude: 7.2633,
  },
  {
    id: 'kubwa',
    name: 'Kubwa Car Park',
    zone: 'Kubwa',
    latitude: 9.1046,
    longitude: 7.3592,
  },
  {
    id: 'lokogoma',
    name: 'Lokogoma Car Park',
    zone: 'Lokogoma',
    latitude: 9.1189,
    longitude: 7.4807,
  },
  {
    id: 'asaba',
    name: 'Asaba Junction Car Park',
    zone: 'Asaba',
    latitude: 9.1236,
    longitude: 7.4691,
  },
];

const routeDefinitions: RouteDefinition[] = [
  { from: 'wuse2', to: 'jabi', instruction: 'Take an along toward Jabi from Wuse 2' },
  { from: 'wuse2', to: 'garki', instruction: 'Take an along toward Garki from Wuse 2' },
  { from: 'wuse2', to: 'utako', instruction: 'Take an along from Wuse 2 to Utako' },
  { from: 'wuse2', to: 'wuse1', instruction: 'Take an along toward Wuse 1 from Wuse 2' },
  { from: 'wuse2', to: 'cbd', instruction: 'Take an along toward the CBD from Wuse 2' },
  { from: 'wuse2', to: 'area1', instruction: 'Take an along toward Area 1 from Wuse 2' },
  { from: 'wuse2', to: 'maitama', instruction: 'Take an along toward Maitama from Wuse 2' },
  { from: 'wuse1', to: 'wuse2', instruction: 'Take an along toward Wuse 2 from Wuse 1' },
  { from: 'wuse1', to: 'area1', instruction: 'Take an along toward Area 1 from Wuse 1' },
  { from: 'wuse1', to: 'garki', instruction: 'Take an along toward Garki from Wuse 1' },
  { from: 'wuse3', to: 'wuse2', instruction: 'Take an along toward Wuse 2 from Wuse 3' },
  { from: 'wuse3', to: 'cbd', instruction: 'Take an along toward the CBD from Wuse 3' },
  { from: 'jabi', to: 'wuse2', instruction: 'Take an along toward Wuse 2 from Jabi' },
  { from: 'jabi', to: 'garki', instruction: 'Take an along from Jabi to Garki' },
  { from: 'jabi', to: 'life-camp', instruction: 'Take an along from Jabi to Life Camp' },
  { from: 'jabi', to: 'utako', instruction: 'Take an along from Jabi to Utako' },
  { from: 'garki', to: 'wuse2', instruction: 'Take an along from Garki to Wuse 2' },
  { from: 'garki', to: 'life-camp', instruction: 'Take an along from Garki to Life Camp' },
  { from: 'garki', to: 'asokoro', instruction: 'Take an along from Garki to Asokoro' },
  { from: 'garki', to: 'cbd', instruction: 'Take an along from Garki to the CBD' },
  { from: 'garki', to: 'berger', instruction: 'Take an along from Garki to Berger' },
  { from: 'life-camp', to: 'garki', instruction: 'Take an along from Life Camp to Garki' },
  { from: 'life-camp', to: 'lokogoma', instruction: 'Take an along from Life Camp to Lokogoma' },
  { from: 'life-camp', to: 'kubwa', instruction: 'Take an along from Life Camp to Kubwa' },
  { from: 'life-camp', to: 'gwarinpa', instruction: 'Take an along from Life Camp to Gwarinpa' },
  { from: 'utako', to: 'asokoro', instruction: 'Take an along from Utako to Asokoro' },
  { from: 'utako', to: 'maitama', instruction: 'Take an along from Utako to Maitama' },
  { from: 'maitama', to: 'cbd', instruction: 'Take an along from Maitama to the CBD' },
  { from: 'maitama', to: 'asokoro', instruction: 'Take an along from Maitama to Asokoro' },
  { from: 'cbd', to: 'wuse2', instruction: 'Take an along from the CBD to Wuse 2' },
  { from: 'cbd', to: 'asokoro', instruction: 'Take an along from the CBD to Asokoro' },
  { from: 'cbd', to: 'garki', instruction: 'Take an along from the CBD to Garki' },
  { from: 'cbd', to: 'area1', instruction: 'Take an along from the CBD to Area 1' },
  { from: 'area1', to: 'berger', instruction: 'Take an along from Area 1 to Berger' },
  { from: 'berger', to: 'kubwa', instruction: 'Take an along from Berger to Kubwa' },
  { from: 'gwarinpa', to: 'kado', instruction: 'Take an along from Gwarinpa to Kado' },
  { from: 'gwarinpa', to: 'life-camp', instruction: 'Take an along from Gwarinpa to Life Camp' },
  { from: 'kado', to: 'wuse2', instruction: 'Take an along from Kado to Wuse 2' },
  { from: 'kado', to: 'garki', instruction: 'Take an along from Kado to Garki' },
  { from: 'apo', to: 'asokoro', instruction: 'Take an along from Apo to Asokoro' },
  { from: 'apo', to: 'cbd', instruction: 'Take an along from Apo to the CBD' },
  { from: 'nyanya', to: 'karu', instruction: 'Take an along from Nyanya to Karu' },
  { from: 'karu', to: 'airport', instruction: 'Take an along from Karu to the airport' },
  { from: 'airport', to: 'kubwa', instruction: 'Take an along from the airport to Kubwa' },
  { from: 'lokogoma', to: 'kubwa', instruction: 'Take an along from Lokogoma to Kubwa' },
  { from: 'asokoro', to: 'wuse2', instruction: 'Take an along from Asokoro to Wuse 2' },
  { from: 'kubwa', to: 'garki', instruction: 'Take an along from Kubwa to Garki' },
  { from: 'kubwa', to: 'airport', instruction: 'Take an along from Kubwa to the airport' },
];

export function getParkById(id: string | undefined) {
  return carParks.find((park) => park.id === id);
}

export function findRoutePath(originId: string | undefined, destinationId: string | undefined): RoutePath | null {
  if (!originId || !destinationId) return null;
  if (originId === destinationId) {
    return {
      legs: [],
      transferPoints: [],
      steps: [`You are already at ${getParkById(originId)?.name || originId}.`],
    };
  }

  type SearchNode = {
    current: string;
    legs: RouteLeg[];
    visited: Set<string>;
  };

  const queue: SearchNode[] = [{ current: originId, legs: [], visited: new Set([originId]) }];

  while (queue.length > 0) {
    const node = queue.shift()!;
    const neighbors = routeDefinitions.filter((route) => route.from === node.current);

    for (const edge of neighbors) {
      if (node.visited.has(edge.to)) continue;

      const nextLeg: RouteLeg = {
        from: edge.from,
        to: edge.to,
        instruction: edge.instruction,
      };
      const legs = [...node.legs, nextLeg];
      const visited = new Set(node.visited);
      visited.add(edge.to);

      if (edge.to === destinationId) {
        const transferPoints = legs.slice(0, -1).map((leg) => getParkById(leg.to)?.name || leg.to);
        return {
          legs,
          transferPoints,
          steps: legs.map((leg) => leg.instruction).concat(`Arrive at ${getParkById(destinationId)?.name || destinationId}`),
        };
      }

      queue.push({ current: edge.to, legs, visited });
    }
  }

  return null;
}

export function searchParks(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return carParks;
  return carParks.filter(
    (park) =>
      park.name.toLowerCase().includes(normalized) ||
      park.zone.toLowerCase().includes(normalized) ||
      park.id.toLowerCase().includes(normalized),
  );
}

export function getAssistantResponse(query: string, routePath: RoutePath | null, originId?: string, destinationId?: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return '';

  const originPark = getParkById(originId);
  const destinationPark = getParkById(destinationId);
  const originName = originPark?.name || originId || 'your selected park';
  const destinationName = destinationPark?.name || destinationId || 'your selected destination';

  if (!routePath || routePath.legs.length === 0) {
    if (originId && destinationId && originId !== destinationId) {
      return `There is not yet a mapped route from ${originName} to ${destinationName}. Try a nearby park pair or pick a direct connection from the list.`;
    }
    return `Please choose both an origin and a destination so I can suggest a route.`;
  }

  const firstInstruction = routePath.legs[0]?.instruction || '';
  const lastInstruction = routePath.steps[routePath.steps.length - 1] || '';
  const transferText = routePath.transferPoints.length > 0
    ? `Transfer at ${routePath.transferPoints.join(', ')}.`
    : 'No transfer needed.';

  const numberedSteps = routePath.steps.map((s, i) => `${i + 1}. ${s}`).join(' ');
  const compactSteps = routePath.steps.join(' → ');

  if (normalized.includes('direct') || normalized.includes('nonstop')) {
    const direct = routePath.legs.length === 1;
    return direct
      ? `Yes — there is a direct along from ${originName} to ${destinationName}. ${transferText}`
      : `No single direct ride from ${originName} to ${destinationName}. ${transferText}`;
  }

  if (normalized.includes('next') || normalized.includes('transfer')) {
    const nextPoint = routePath.transferPoints[0] || destinationName;
    return `Next: ${firstInstruction}. Then continue toward ${nextPoint} and arrive at ${destinationName}.`;
  }

  if (normalized.includes('fastest') || normalized.includes('best')) {
    return `Suggested route (${routePath.legs.length} leg${routePath.legs.length === 1 ? '' : 's'}): ${compactSteps}.`;
  }

  if (normalized.includes('how') || normalized.includes('route') || normalized.includes('go') || normalized.includes('steps')) {
    return `Step-by-step from ${originName} to ${destinationName}: ${numberedSteps} ${transferText} Total legs: ${routePath.legs.length}.`;
  }

  // Default: provide a helpful, fuller route description
  return `From ${originName}: ${compactSteps}. ${transferText} Details: ${numberedSteps}`;
}
