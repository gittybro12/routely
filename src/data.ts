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

// Reverse links are sample assumptions. Evidence and geometry apply only to the checked direction.
export const routeDefinitions: RouteDefinition[] = (() => {
  const map = new Map<string, RouteDefinition>();

  const addEdge = (definition: RouteDefinition) => {
    const key = `${definition.from}->${definition.to}`;
    if (!map.has(key)) {
      map.set(key, { verification: { status: 'sample' }, ...definition });
    }
  };

  rawRouteDefinitions.forEach((def) => {
    addEdge(def);
  });

  // Add reverse assumptions after explicit directions so they cannot hide a checked entry.
  rawRouteDefinitions.forEach((def) => {
    const fromPark = carParks.find((p) => p.id === def.from);
    const toPark = carParks.find((p) => p.id === def.to);
    addEdge({ from: def.to, to: def.from,
      instruction: `Sample connection from ${toPark?.name || def.to} to ${fromPark?.name || def.from}; service needs checking`,
      verification: { status: 'sample' },
    });
  });

  return Array.from(map.values());
})();

export function getParkById(id: string | undefined) {
  return carParks.find((park) => park.id === id);
}

export function findRoutePath(originId: string | undefined, destinationId: string | undefined): RoutePath | null {
  if (!originId || !destinationId || !getParkById(originId) || !getParkById(destinationId)) return null;
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

      const nextLeg: RouteLeg = { ...edge };
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

function normalizeStopSearch(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/g, '$1 $2')
    .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

function oneTypingMistake(first: string, second: string) {
  if (first.length < 4 || second.length < 4 || /\d/.test(first + second) || Math.abs(first.length - second.length) > 1) return false;
  if (first === second) return true;
  if (first.length === second.length) {
    const differences = Array.from(first, (_, index) => index).filter((index) => first[index] !== second[index]);
    return differences.length === 1 || (differences.length === 2 && differences[1] === differences[0] + 1 &&
      first[differences[0]] === second[differences[1]] && first[differences[1]] === second[differences[0]]);
  }
  const [shorter, longer] = first.length < second.length ? [first, second] : [second, first];
  for (let index = 0; index < longer.length; index += 1) {
    if (longer.slice(0, index) + longer.slice(index + 1) === shorter) return true;
  }
  return false;
}

export function searchParks(query: string, options: readonly CarPark[] = carParks): CarPark[] {
  if (!query.trim()) return [...options];
  const normalized = normalizeStopSearch(query);
  if (!normalized) return [];
  const compact = normalized.replace(/ /g, '');
  const words = normalized.split(' ');
  return options.map((park, index) => {
    const names = [park.name, park.zone, park.id, ...(parkAliases[park.id] || [])].map(normalizeStopSearch);
    const score = Math.min(...names.map((name) => {
      const joined = name.replace(/ /g, '');
      if (name === normalized || joined === compact) return 0;
      if (name.startsWith(normalized) || joined.startsWith(compact)) return 1;
      if (name.includes(normalized) || joined.includes(compact)) return 2;
      const nameWords = name.split(' ');
      if (words.every((word) => nameWords.some((part) => part.startsWith(word)))) return 3;
      if (words.every((word) => nameWords.some((part) => part.startsWith(word) || oneTypingMistake(word, part)))) return 4;
      return Infinity;
    }));
    return { park, score, index };
  }).filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => a.score - b.score || a.index - b.index).map(({ park }) => park);
}

export interface AIResponse {
  text: string;
  origin?: CarPark;
  destination?: CarPark;
  route?: RoutePath | null;
}

const parkAliases: Record<string, string[]> = {
  'wuse2': ['wuse 2', 'wuse two', 'wuse ii', 'banex'],
  'wuse1': ['wuse 1', 'wuse one', 'wuse i', 'wuse market'],
  'wuse3': ['wuse 3', 'wuse three', 'wuse iii'],
  'berger': ['berger', 'berger junction', 'berger roundabout', 'berger hub'],
  'jabi': ['jabi'],
  'utako': ['utako'],
  'kado': ['kado'],
  'life-camp': ['life camp'],
  'gwarinpa': ['gwarinpa'],
  'kubwa': ['kubwa'],
  'cbd': ['cbd', 'abuja cbd', 'central business district'],
  'maitama': ['maitama'],
  'garki': ['garki', 'garki area 2'],
  'area1': ['area 1', 'area one', 'area one hub'],
  'apo': ['apo', 'gudu', 'apo gudu'],
  'lokogoma': ['lokogoma'],
  'asokoro': ['asokoro', 'aya'],
  'nyanya': ['nyanya'],
  'karu': ['karu'],
  'lugbe': ['lugbe'],
  'airport': ['airport', 'naia', 'nnamdi azikiwe airport'],
};

function normalizeAssistantText(value: string) {
  return value
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function findMentionedParks(query: string) {
  const normalizedQuery = normalizeAssistantText(query);
  const paddedQuery = ' ' + normalizedQuery + ' ';
  const mentions: { park: CarPark; index: number; length: number }[] = [];

  carParks.forEach((park) => {
    const aliases = [
      park.name,
      park.zone,
      park.id,
      ...(parkAliases[park.id] || []),
    ]
      .map(normalizeAssistantText)
      .filter(Boolean);

    aliases.forEach((alias) => {
      const phrase = ' ' + alias + ' ';
      let offset = 0;
      let index = paddedQuery.indexOf(phrase, offset);

      while (index !== -1) {
        const followingWords = paddedQuery.slice(index + phrase.length);
        if (park.id === 'airport' && /^\s*road\b/.test(followingWords)) {
          offset = index + phrase.length - 1;
          index = paddedQuery.indexOf(phrase, offset);
          continue;
        }
        mentions.push({ park, index, length: alias.length });
        offset = index + phrase.length - 1;
        index = paddedQuery.indexOf(phrase, offset);
      }
    });
  });

  // Prefer the longest matching alias when two names start at the same word.
  mentions.sort((a, b) => a.index - b.index || b.length - a.length);
  const uniqueMentions = new Map<string, { park: CarPark; index: number; length: number }>();
  mentions.forEach((mention) => {
    const key = mention.park.id + ':' + mention.index;
    if (!uniqueMentions.has(key)) uniqueMentions.set(key, mention);
  });

  return Array.from(uniqueMentions.values()).sort((a, b) => a.index - b.index);
}

function getMentionEndpointRole(query: string, mention: { index: number }) {
  const prefix = ' ' + query.slice(0, Math.max(0, mention.index - 1)) + ' ';
  const fromIndex = prefix.lastIndexOf(' from ');
  const toIndex = prefix.lastIndexOf(' to ');

  if (fromIndex > toIndex) return 'origin';
  if (toIndex > fromIndex) return 'destination';
  return undefined;
}
function getMappedHubs() {
  const connectionCounts = new Map<string, number>();
  routeDefinitions.forEach(({ from }) => {
    connectionCounts.set(from, (connectionCounts.get(from) || 0) + 1);
  });

  return Array.from(connectionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([parkId]) => getParkById(parkId))
    .filter((park): park is CarPark => Boolean(park));
}

function getDataLimitNote(query: string) {
  const normalized = normalizeAssistantText(query);
  const asksForTime = /\b(time|long|duration|traffic|delay|fastest|quickest|best)\b/.test(normalized);
  const asksForFare = /\b(fare|price|cost|cheap|expensive)\b/.test(normalized);

  if (asksForTime && asksForFare) {
    return 'Routely does not have live traffic, journey-time, or fare data yet. ';
  }
  if (asksForTime) {
    return 'Routely does not have live traffic or journey-time data yet. ';
  }
  if (asksForFare) {
    return 'Routely does not have fare data yet. ';
  }
  return '';
}

export function getAssistantResponse(query: string, routePath: RoutePath | null, originId?: string, destinationId?: string) {
  const normalized = normalizeAssistantText(query);
  if (!normalized) return '';

  const originPark = getParkById(originId);
  const destinationPark = getParkById(destinationId);
  const originName = originPark?.name || originId || 'your selected stop';
  const destinationName = destinationPark?.name || destinationId || 'your selected destination';

  if (originId && destinationId && originId === destinationId) {
    return 'You are already at ' + originName + '. Choose a different destination to plan another trip.';
  }

  if (!routePath || routePath.legs.length === 0) {
    if (originId && destinationId) {
      return 'I could not find a mapped route from ' + originName + ' to ' + destinationName + '. Try another pair of stops shown in the Abuja map.';
    }
    return 'Choose an origin and destination from the mapped Abuja stops so I can suggest a route.';
  }

  const transferText = routePath.transferPoints.length > 0
    ? 'Transfer at ' + routePath.transferPoints.join(', ') + '.'
    : 'No transfer is needed.';

  const numberedSteps = routePath.steps.map((step, index) => (index + 1) + '. ' + step).join(' ');

  if (/\b(direct|nonstop)\b/.test(normalized)) {
    const direct = routePath.legs.length === 1;
    return direct
      ? 'Yes, there is a direct mapped route from ' + originName + ' to ' + destinationName + '. ' + transferText
      : 'There is no single direct ride from ' + originName + ' to ' + destinationName + '. ' + transferText;
  }

  if (/\b(next|transfer)\b/.test(normalized)) {
    const nextPoint = routePath.transferPoints[0] || destinationName;
    return 'The next step: ' + routePath.legs[0].instruction + '. Then continue toward ' + nextPoint + ' and arrive at ' + destinationName + '.';
  }

  if (/\b(fastest|quickest|best)\b/.test(normalized)) {
    return 'The route with the fewest mapped legs has ' + routePath.legs.length + ' leg' + (routePath.legs.length === 1 ? '' : 's') + ': ' + routePath.steps.join(' Then ') + ' ' + transferText;
  }

  if (/\b(how|route|go|steps|directions|commute|travel|get|way)\b/.test(normalized)) {
    return 'Step by step from ' + originName + ' to ' + destinationName + ': ' + numberedSteps + ' ' + transferText;
  }

  return 'From ' + originName + ' to ' + destinationName + ': ' + routePath.steps.join(' Then ') + ' ' + transferText;
}

export function parseAndRespondAI(query: string, currentOriginId?: string, currentDestId?: string): AIResponse {
  const normalized = normalizeAssistantText(query);
  if (!normalized) {
    return { text: 'Hello! What Abuja trip can I help you plan?' };
  }

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)$/.test(normalized)) {
    return {
      text: 'Hello! I can help with routes between mapped Abuja stops, route connections, and the transport hubs in Routely. Where are you heading?',
    };
  }

  const mentions = findMentionedParks(query);
  const asksForRoute = /\b(route|directions|commute|travel|go|reach|ride|transfer|direct|fastest|quickest|steps)\b/.test(normalized)
    || /\bhow (?:do|can) i get\b|\bget (?:me )?to\b|\bway to\b|\btake me to\b|\b(?:bus|taxi|shuttle)\b.*\bto\b|\bfrom\b.*\bto\b/.test(normalized)
    || mentions.length >= 2;

  if (asksForRoute) {
    let originPark: CarPark | undefined;
    let destinationPark: CarPark | undefined;

    if (mentions.length >= 2) {
      const firstRole = getMentionEndpointRole(normalized, mentions[0]);
      const secondRole = getMentionEndpointRole(normalized, mentions[1]);
      const reverseOrder = (secondRole === 'origin' && firstRole !== 'origin')
        || (firstRole === 'destination' && secondRole !== 'destination');
      const originMention = reverseOrder ? mentions[1] : mentions[0];
      const destinationMention = reverseOrder ? mentions[0] : mentions[1];
      originPark = originMention.park;
      destinationPark = destinationMention.park;
    } else if (mentions.length === 1) {
      const mention = mentions[0];
      if (getMentionEndpointRole(normalized, mention) === 'origin') {
        originPark = mention.park;
        destinationPark = getParkById(currentDestId);
      } else {
        originPark = getParkById(currentOriginId);
        destinationPark = mention.park;
      }
    } else {
      originPark = getParkById(currentOriginId);
      destinationPark = getParkById(currentDestId);
    }

    if (!originPark || !destinationPark) {
      return {
        text: 'Name both the starting stop and destination, for example: “How do I get from Wuse 2 to Airport?”',
      };
    }

    if (originPark.id === destinationPark.id) {
      return {
        text: 'You are already at ' + originPark.name + '. Choose a different destination to plan another trip.',
        origin: originPark,
        destination: destinationPark,
      };
    }

    const route = findRoutePath(originPark.id, destinationPark.id);
    if (!route) {
      return {
        text: 'I could not find a mapped route from ' + originPark.name + ' to ' + destinationPark.name + '. Try another pair of stops shown in the Abuja map.',
        origin: originPark,
        destination: destinationPark,
      };
    }

    const limitation = getDataLimitNote(query);
    const response = getAssistantResponse(query, route, originPark.id, destinationPark.id);
    return {
      text: limitation + response,
      origin: originPark,
      destination: destinationPark,
      route,
    };
  }

  if (/\b(hub|hubs|major|connected)\b/.test(normalized)) {
    const hubs = getMappedHubs().map((park) => park.name.replace(' Car Park', ''));
    return {
      text: 'In Routely’s mapped network, the most connected stops are ' + hubs.join(', ') + '. This reflects the routes currently in the app.',
    };
  }

  if (/\b(along|taxi|shuttle|bus|fare|price|cost)\b/.test(normalized)) {
    return {
      text: 'Routely’s route map includes shared “along” taxis and a few shuttle connections. Confirm the destination with the driver or operator before boarding. ' + getDataLimitNote(query),
    };
  }

  if (mentions.length === 1 && /\b(where|location|zone|located|about|what|which)\b/.test(normalized)) {
    const park = mentions[0].park;
    return {
      text: park.name + ' is listed in the ' + park.zone + ' area in Routely’s Abuja map.',
    };
  }

  return {
    text: 'I can help with routes between stops in Routely’s Abuja map, mapped transport hubs, and the “along” taxi connections it lists. I do not have live traffic, journey times, or fares. Try asking “How do I get from Wuse 2 to Airport?”',
  };
}
