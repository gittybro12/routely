import type { CarPark, RouteDefinition, RoutePath, RouteLeg } from './types';

export const carParks: CarPark[] = [
  {
    id: 'wuse2',
    name: 'Wuse 2 Car Park',
    zone: 'Wuse 2',
    latitude: 9.0770,
    longitude: 7.4810,
  },
  {
    id: 'wuse1',
    name: 'Wuse 1 Car Park',
    zone: 'Wuse 1 / Market',
    latitude: 9.0620,
    longitude: 7.4820,
  },
  {
    id: 'wuse3',
    name: 'Wuse 3 Car Park',
    zone: 'Wuse 3',
    latitude: 9.0720,
    longitude: 7.4720,
  },
  {
    id: 'berger',
    name: 'Berger Transport Hub',
    zone: 'Berger Junction',
    latitude: 9.0590,
    longitude: 7.4560,
  },
  {
    id: 'jabi',
    name: 'Jabi Car Park',
    zone: 'Jabi',
    latitude: 9.0740,
    longitude: 7.4220,
  },
  {
    id: 'utako',
    name: 'Utako Car Park',
    zone: 'Utako',
    latitude: 9.0680,
    longitude: 7.4470,
  },
  {
    id: 'kado',
    name: 'Kado Car Park',
    zone: 'Kado',
    latitude: 9.0850,
    longitude: 7.4400,
  },
  {
    id: 'life-camp',
    name: 'Life Camp Car Park',
    zone: 'Life Camp',
    latitude: 9.0880,
    longitude: 7.4080,
  },
  {
    id: 'gwarinpa',
    name: 'Gwarinpa Car Park',
    zone: 'Gwarinpa',
    latitude: 9.1150,
    longitude: 7.4120,
  },
  {
    id: 'kubwa',
    name: 'Kubwa Car Park',
    zone: 'Kubwa',
    latitude: 9.1520,
    longitude: 7.3420,
  },
  {
    id: 'cbd',
    name: 'CBD Car Park',
    zone: 'Abuja CBD',
    latitude: 9.0550,
    longitude: 7.4930,
  },
  {
    id: 'maitama',
    name: 'Maitama Car Park',
    zone: 'Maitama',
    latitude: 9.0880,
    longitude: 7.4920,
  },
  {
    id: 'garki',
    name: 'Garki Car Park',
    zone: 'Garki Area 2',
    latitude: 9.0360,
    longitude: 7.4860,
  },
  {
    id: 'area1',
    name: 'Area 1 Transport Hub',
    zone: 'Area 1',
    latitude: 9.0340,
    longitude: 7.4710,
  },
  {
    id: 'apo',
    name: 'Apo Car Park',
    zone: 'Apo / Gudu',
    latitude: 9.0060,
    longitude: 7.4880,
  },
  {
    id: 'lokogoma',
    name: 'Lokogoma Car Park',
    zone: 'Lokogoma',
    latitude: 8.9850,
    longitude: 7.4720,
  },
  {
    id: 'asokoro',
    name: 'Asokoro Car Park',
    zone: 'Asokoro / AYA',
    latitude: 9.0480,
    longitude: 7.5260,
  },
  {
    id: 'nyanya',
    name: 'Nyanya Park',
    zone: 'Nyanya',
    latitude: 9.0280,
    longitude: 7.5870,
  },
  {
    id: 'karu',
    name: 'Karu Bus Park',
    zone: 'Karu',
    latitude: 9.0230,
    longitude: 7.5680,
  },
  {
    id: 'lugbe',
    name: 'Lugbe Transport Hub',
    zone: 'Lugbe',
    latitude: 8.9720,
    longitude: 7.3780,
  },
  {
    id: 'airport',
    name: 'Abuja Airport Car Park',
    zone: 'Airport',
    latitude: 9.0060,
    longitude: 7.2630,
  },
];

const rawRouteDefinitions: RouteDefinition[] = [
  // Wuse 2 Connections
  { from: 'wuse2', to: 'wuse1', instruction: 'Take an along taxi from Wuse 2 to Wuse 1 Market' },
  { from: 'wuse2', to: 'garki', instruction: 'Take an along taxi from Wuse 2 toward Garki' },
  { from: 'wuse2', to: 'jabi', instruction: 'Take an along taxi from Wuse 2 toward Jabi' },
  { from: 'wuse2', to: 'maitama', instruction: 'Take an along taxi from Wuse 2 to Maitama' },
  { from: 'wuse2', to: 'cbd', instruction: 'Take an along taxi from Wuse 2 to CBD Secretariat' },
  { from: 'wuse2', to: 'utako', instruction: 'Take an along taxi from Wuse 2 to Utako Park' },
  { from: 'wuse2', to: 'kado', instruction: 'Take an along taxi from Wuse 2 to Kado Park' },

  // Wuse 1 Market Connections
  { from: 'wuse1', to: 'berger', instruction: 'Take an along taxi from Wuse 1 to Berger Roundabout' },
  { from: 'wuse1', to: 'area1', instruction: 'Take an along taxi from Wuse 1 to Area 1 Transport Hub' },
  { from: 'wuse1', to: 'garki', instruction: 'Take an along taxi from Wuse 1 to Garki Car Park' },
  { from: 'wuse1', to: 'cbd', instruction: 'Take an along taxi from Wuse 1 to CBD Secretariat' },
  { from: 'wuse3', to: 'wuse2', instruction: 'Take an along taxi from Wuse 3 to Wuse 2' },

  // Berger Junction Central Hub
  { from: 'berger', to: 'jabi', instruction: 'Take an along taxi from Berger Hub to Jabi Car Park' },
  { from: 'berger', to: 'utako', instruction: 'Take an along taxi from Berger Hub to Utako Park' },
  { from: 'berger', to: 'area1', instruction: 'Take an along taxi from Berger Hub to Area 1 Hub' },
  { from: 'berger', to: 'life-camp', instruction: 'Take an along taxi from Berger Hub to Life Camp' },
  { from: 'berger', to: 'gwarinpa', instruction: 'Take an along taxi from Berger Hub to Gwarinpa' },
  { from: 'berger', to: 'kubwa', instruction: 'Take an along taxi via Kubwa Expressway from Berger to Kubwa' },
  { from: 'berger', to: 'cbd', instruction: 'Take an along taxi from Berger Hub to CBD' },

  // Jabi & Utako Connections
  { from: 'jabi', to: 'utako', instruction: 'Take an along taxi from Jabi to Utako Park' },
  { from: 'jabi', to: 'life-camp', instruction: 'Take an along taxi from Jabi to Life Camp' },
  { from: 'jabi', to: 'kado', instruction: 'Take an along taxi from Jabi to Kado Park' },
  { from: 'utako', to: 'maitama', instruction: 'Take an along taxi from Utako to Maitama' },
  { from: 'utako', to: 'asokoro', instruction: 'Take an along taxi from Utako to AYA Asokoro' },

  // Life Camp & Gwarinpa & Kado Corridor
  { from: 'life-camp', to: 'gwarinpa', instruction: 'Take an along taxi from Life Camp to Gwarinpa' },
  { from: 'life-camp', to: 'kado', instruction: 'Take an along taxi from Life Camp to Kado Park' },
  { from: 'gwarinpa', to: 'kubwa', instruction: 'Take an along taxi via Kubwa Expressway from Gwarinpa to Kubwa' },

  // Area 1 & Garki & Apo Southern Hubs
  { from: 'area1', to: 'garki', instruction: 'Take an along taxi from Area 1 to Garki' },
  { from: 'area1', to: 'cbd', instruction: 'Take an along taxi from Area 1 to CBD Secretariat' },
  { from: 'area1', to: 'asokoro', instruction: 'Take an along taxi from Area 1 to AYA Asokoro' },
  { from: 'area1', to: 'apo', instruction: 'Take an along taxi from Area 1 to Apo / Gudu' },
  { from: 'area1', to: 'lugbe', instruction: 'Take an along taxi via Airport Road from Area 1 to Lugbe' },

  // Lugbe & Airport Corridor
  { from: 'lugbe', to: 'airport', instruction: 'Take an along shuttle/taxi from Lugbe to Nnamdi Azikiwe Airport' },
  { from: 'area1', to: 'airport', instruction: 'Take an airport express shuttle from Area 1 to Nnamdi Azikiwe Airport' },

  // Asokoro (AYA), Nyanya & Karu Eastern Corridor
  { from: 'garki', to: 'asokoro', instruction: 'Take an along taxi from Garki to AYA Asokoro' },
  { from: 'garki', to: 'cbd', instruction: 'Take an along taxi from Garki to CBD' },
  { from: 'asokoro', to: 'cbd', instruction: 'Take an along taxi from AYA Asokoro to CBD Secretariat' },
  { from: 'asokoro', to: 'maitama', instruction: 'Take an along taxi from AYA Asokoro to Maitama' },
  { from: 'asokoro', to: 'nyanya', instruction: 'Take an along taxi via Nyanya Expressway from AYA to Nyanya Park' },
  { from: 'nyanya', to: 'karu', instruction: 'Take an along taxi from Nyanya to Karu Bus Park' },
  { from: 'karu', to: 'asokoro', instruction: 'Take an along taxi from Karu to AYA Asokoro' },

  // Apo & Lokogoma Hubs
  { from: 'apo', to: 'lokogoma', instruction: 'Take an along taxi from Apo to Lokogoma' },
  { from: 'lokogoma', to: 'lugbe', instruction: 'Take an along taxi from Lokogoma to Lugbe' },
];

// Automatically generate bidirectional routes so reverse direction always works cleanly
export const routeDefinitions: RouteDefinition[] = (() => {
  const map = new Map<string, RouteDefinition>();

  const addEdge = (from: string, to: string, instruction: string) => {
    const key = `${from}->${to}`;
    if (!map.has(key)) {
      map.set(key, { from, to, instruction });
    }
  };

  rawRouteDefinitions.forEach((def) => {
    addEdge(def.from, def.to, def.instruction);

    const fromPark = carParks.find((p) => p.id === def.from);
    const toPark = carParks.find((p) => p.id === def.to);

    const reverseInstruction = `Take an along taxi from ${toPark?.name.replace(' Car Park', '') || def.to} to ${fromPark?.name.replace(' Car Park', '') || def.from}`;
    addEdge(def.to, def.from, reverseInstruction);
  });

  return Array.from(map.values());
})();

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

export interface AIResponse {
  text: string;
  origin?: CarPark;
  destination?: CarPark;
  route?: RoutePath | null;
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
  const transferText = routePath.transferPoints.length > 0
    ? `Transfer at ${routePath.transferPoints.join(', ')}.`
    : 'No transfer needed.';

  const numberedSteps = routePath.steps.map((s, i) => `${i + 1}. ${s}`).join(' ');
  const compactSteps = routePath.steps.join(' → ');

  if (normalized.includes('direct') || normalized.includes('nonstop')) {
    const direct = routePath.legs.length === 1;
    return direct
      ? `Yes — there is a direct along route from ${originName} to ${destinationName}. ${transferText}`
      : `No single direct ride from ${originName} to ${destinationName}. ${transferText}`;
  }

  if (normalized.includes('next') || normalized.includes('transfer')) {
    const nextPoint = routePath.transferPoints[0] || destinationName;
    return `Next step: ${firstInstruction}. Then continue toward ${nextPoint} and arrive at ${destinationName}.`;
  }

  if (normalized.includes('fastest') || normalized.includes('best')) {
    return `Suggested route (${routePath.legs.length} leg${routePath.legs.length === 1 ? '' : 's'}): ${compactSteps}.`;
  }

  if (normalized.includes('how') || normalized.includes('route') || normalized.includes('go') || normalized.includes('steps')) {
    return `Step-by-step from ${originName} to ${destinationName}: ${numberedSteps} ${transferText} Total legs: ${routePath.legs.length}.`;
  }

  return `From ${originName}: ${compactSteps}. ${transferText} Details: ${numberedSteps}`;
}

export function parseAndRespondAI(query: string, currentOriginId?: string, currentDestId?: string): AIResponse {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { text: "Hello! I am Routely AI. How can I help you plan your commute in Abuja today?" };
  }

  // Find all matched car parks in the user query
  const matchedParks: { park: CarPark; index: number }[] = [];

  carParks.forEach((park) => {
    const nameLower = park.name.toLowerCase();
    const zoneLower = park.zone.toLowerCase();
    const idLower = park.id.toLowerCase();

    let idx = normalized.indexOf(nameLower);
    if (idx === -1) idx = normalized.indexOf(zoneLower);
    if (idx === -1) idx = normalized.indexOf(idLower);

    // Common alias matching for Abuja locations
    if (idx === -1) {
      if (idLower === 'wuse1' && (normalized.includes('wuse 1') || normalized.includes('wuse market'))) idx = 0;
      else if (idLower === 'wuse2' && (normalized.includes('wuse 2') || normalized.includes('banex'))) idx = 0;
      else if (idLower === 'berger' && (normalized.includes('berger') || normalized.includes('berger junction'))) idx = 0;
      else if (idLower === 'area1' && (normalized.includes('area 1') || normalized.includes('area1'))) idx = 0;
      else if (idLower === 'asokoro' && (normalized.includes('asokoro') || normalized.includes('aya'))) idx = 0;
      else if (idLower === 'airport' && (normalized.includes('airport') || normalized.includes('naia'))) idx = 0;
      else if (idLower === 'kubwa' && normalized.includes('kubwa')) idx = 0;
      else if (idLower === 'jabi' && normalized.includes('jabi')) idx = 0;
      else if (idLower === 'garki' && normalized.includes('garki')) idx = 0;
      else if (idLower === 'gwarinpa' && normalized.includes('gwarinpa')) idx = 0;
      else if (idLower === 'life-camp' && normalized.includes('life camp')) idx = 0;
    }

    if (idx !== -1) {
      matchedParks.push({ park, index: idx });
    }
  });

  // Sort matched parks by their order in the query string
  matchedParks.sort((a, b) => a.index - b.index);

  let originPark: CarPark | undefined;
  let destPark: CarPark | undefined;

  if (matchedParks.length >= 2) {
    originPark = matchedParks[0].park;
    destPark = matchedParks[1].park;
  } else if (matchedParks.length === 1) {
    destPark = matchedParks[0].park;
    originPark = getParkById(currentOriginId) || carParks[0];
  } else {
    originPark = getParkById(currentOriginId);
    destPark = getParkById(currentDestId);
  }

  if (originPark && destPark && originPark.id !== destPark.id) {
    const route = findRoutePath(originPark.id, destPark.id);
    if (route) {
      const transferText = route.transferPoints.length > 0
        ? `You will need to transfer at ${route.transferPoints.join(', ')}.`
        : `This is a direct along route with no transfers required.`;

      const text = `I found a route from **${originPark.name}** to **${destPark.name}** (${route.legs.length} leg${route.legs.length === 1 ? '' : 's'}). ${transferText}`;
      return { text, origin: originPark, destination: destPark, route };
    }
  }

  // Fallback conversational responses
  if (normalized.includes('hub') || normalized.includes('park') || normalized.includes('major')) {
    return {
      text: "The major public transport hubs in Abuja are **Berger Roundabout** (connects Kubwa, Gwarinpa, Wuse, Jabi), **Area 1 Roundabout** (connects Garki, Airport Road, Apo, Nyanya), **Wuse Market**, **Jabi Motor Park**, and **AYA Asokoro**.",
    };
  }

  if (normalized.includes('along') || normalized.includes('taxi') || normalized.includes('how to')) {
    return {
      text: "Abuja 'Along' taxis are shared cabs operating along fixed arterial corridors. Passengers queue or flag cabs at major roundabouts like Berger, Area 1, Wuse Market, or AYA Asokoro. Always confirm your destination with the driver before boarding.",
    };
  }

  return {
    text: getAssistantResponse(query, findRoutePath(originPark?.id, destPark?.id), originPark?.id, destPark?.id),
    origin: originPark,
    destination: destPark,
    route: findRoutePath(originPark?.id, destPark?.id),
  };
}
