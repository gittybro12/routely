import { carParks, findRoutePath, routeDefinitions } from './data';
import type { AIResponse } from './data';

export interface LocalChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface OllamaToolCall {
  function: {
    name: string;
    arguments: Record<string, unknown> | string;
  };
}

interface OllamaMessage {
  role: 'assistant';
  content: string;
  tool_calls?: OllamaToolCall[];
}

interface OllamaRequestMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_name?: string;
  tool_calls?: OllamaToolCall[];
}
interface OllamaResponse {
  message?: OllamaMessage;
  error?: string;
}

interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface AssistantRequest {
  query: string;
  history: LocalChatTurn[];
  currentOriginId?: string;
  currentDestinationId?: string;
}

const MODEL_NAME = 'qwen3.5:4b';
const parkIds = carParks.map((park) => park.id);

const assistantTools: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'find_route',
      description: 'Find the actual mapped route between two Routely stops. Always use this before answering a route or transfer question.',
      parameters: {
        type: 'object',
        required: ['originId', 'destinationId'],
        properties: {
          originId: { type: 'string', enum: parkIds, description: 'ID of the starting stop' },
          destinationId: { type: 'string', enum: parkIds, description: 'ID of the destination stop' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_mapped_stops',
      description: 'List the stops and zones that currently exist in Routely’s Abuja map.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_mapped_hubs',
      description: 'Return the most connected stops in Routely’s currently mapped network.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
];

function getHubs() {
  const connections = new Map<string, Set<string>>();

  routeDefinitions.forEach(({ from, to }) => {
    const neighbors = connections.get(from) || new Set<string>();
    neighbors.add(to);
    connections.set(from, neighbors);
  });

  return Array.from(connections.entries())
    .sort((first, second) => second[1].size - first[1].size)
    .slice(0, 5)
    .map(([id, neighbors]) => {
      const park = carParks.find((candidate) => candidate.id === id);
      return {
        id,
        name: park?.name || id,
        connections: neighbors.size,
      };
    });
}

function readArguments(value: Record<string, unknown> | string): Record<string, unknown> {
  if (typeof value !== 'string') return value;
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function runTool(
  name: string,
  rawArguments: Record<string, unknown> | string,
  currentOriginId?: string,
  currentDestinationId?: string,
): { result: unknown; routeResponse?: AIResponse } {
  const args = readArguments(rawArguments);

  if (name === 'find_route') {
    const originId = String(args.originId || currentOriginId || '');
    const destinationId = String(args.destinationId || currentDestinationId || '');
    const origin = carParks.find((park) => park.id === originId);
    const destination = carParks.find((park) => park.id === destinationId);

    if (!origin || !destination) {
      return {
        result: {
          error: 'Both endpoints must be stops in the supplied Routely stop list.',
          availableStops: carParks.map(({ id, name }) => ({ id, name })),
        },
      };
    }

    const route = findRoutePath(origin.id, destination.id);
    if (!route) {
      return {
        result: {
          found: false,
          origin: origin.name,
          destination: destination.name,
          message: 'There is no mapped connection between these stops in Routely’s current route data.',
        },
        routeResponse: { text: '', origin, destination },
      };
    }

    return {
      result: {
        found: true,
        origin: { id: origin.id, name: origin.name, zone: origin.zone },
        destination: { id: destination.id, name: destination.name, zone: destination.zone },
        route,
        note: 'This is sample stop-to-stop guidance. Connections, boarding landmarks, transport modes, and direction need field checking. Routely has no live traffic, travel-time, or fare data.',
      },
      routeResponse: { text: '', origin, destination, route },
    };
  }

  if (name === 'list_mapped_stops') {
    return {
      result: carParks.map(({ id, name, zone }) => ({ id, name, zone })),
    };
  }

  if (name === 'list_mapped_hubs') {
    return { result: getHubs() };
  }

  return { result: { error: 'Unknown Routely tool.' } };
}

function buildSystemPrompt(currentOriginId?: string, currentDestinationId?: string) {
  const currentOrigin = carParks.find((park) => park.id === currentOriginId);
  const currentDestination = carParks.find((park) => park.id === currentDestinationId);
  const stopDirectory = carParks
    .map((park) => '- ' + park.id + ': ' + park.name + ' (' + park.zone + ')')
    .join('\n');

  return [
    'You are Routely’s friendly, concise Abuja transport assistant. This is a sample network: its stops, connections, and boarding points have not been field-checked. State this when suggesting a journey.',
    'Answer naturally. You are connected to Routely’s actual local route data through tools.',
    'For any question asking for directions, route availability, transfers, or how to get somewhere, call find_route before answering. Use its returned route instructions and never invent a stop, connection, transfer, fare, or journey time.',
    'When a question asks what stops exist, call list_mapped_stops. For questions about major or connected transport hubs, call list_mapped_hubs.',
    'If the user gives one endpoint or refers to the selected route, use the current map selection for any omitted endpoint. If the endpoints are unclear, ask one short clarification.',
    'If a question asks for live traffic, journey duration, or fares, say Routely does not currently have that data.',
    'Stops in this version of Routely:\n' + stopDirectory,
    'Current map selection: origin=' + (currentOrigin ? currentOrigin.name + ' (' + currentOrigin.id + ')' : 'not selected') +
      '; destination=' + (currentDestination ? currentDestination.name + ' (' + currentDestination.id + ')' : 'not selected') + '.',
  ].join('\n\n');
}

export async function askRoutelyLocalModel({
  query,
  history,
  currentOriginId,
  currentDestinationId,
}: AssistantRequest): Promise<AIResponse> {
  const messages: OllamaRequestMessage[] = [
    { role: 'system', content: buildSystemPrompt(currentOriginId, currentDestinationId) },
    ...history.slice(-12).map((turn) => ({ role: turn.role, content: turn.content })),
    { role: 'user', content: query },
  ];
  let routeResponse: AIResponse | undefined;

  for (let round = 0; round < 5; round += 1) {
    let response: Response;
    try {
      response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages,
          tools: assistantTools,
          stream: false,
          think: false,
          options: { temperature: 0.2, num_predict: 256 },
        }),
        signal: AbortSignal.timeout(90_000),
      });
    } catch (error) {
      if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
        throw new Error('The local model took too long to respond. Try a shorter question, then try again.');
      }
      throw new Error('I can’t reach the local AI model. Start Ollama, then try again. Setup steps are in AI_SETUP.md.');
    }

    const payload = await response.json().catch(() => ({} as OllamaResponse)) as OllamaResponse;
    if (!response.ok) {
      const details = payload.error || '';
      if (details.toLowerCase().includes('not found') || response.status === 404) {
        throw new Error('The local model is not ready yet. In a terminal, run: ollama pull ' + MODEL_NAME);
      }
      throw new Error(details || 'Ollama returned an error. Check that it is running and try again.');
    }

    const assistantMessage = payload.message;
    if (!assistantMessage) {
      throw new Error('Ollama returned an empty reply. Please try again.');
    }

    if (!assistantMessage.tool_calls?.length) {
      const text = assistantMessage.content?.trim();
      return {
        ...(routeResponse || {}),
        text: text || 'I could not form a reply from the mapped data. Please try asking another way.',
      };
    }

    messages.push(assistantMessage);
    assistantMessage.tool_calls.forEach((call) => {
      const { result, routeResponse: toolRouteResponse } = runTool(
        call.function.name,
        call.function.arguments,
        currentOriginId,
        currentDestinationId,
      );
      if (toolRouteResponse) routeResponse = toolRouteResponse;
      messages.push({
        role: 'tool',
        tool_name: call.function.name,
        content: JSON.stringify(result),
      });
    });
  }

  throw new Error('I could not finish that answer. Please try asking in a shorter way.');
}
