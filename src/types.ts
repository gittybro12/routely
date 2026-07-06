export interface CarPark {
  id: string;
  name: string;
  zone: string;
  latitude: number;
  longitude: number;
}

export interface RouteDefinition {
  from: string;
  to: string;
  instruction: string;
}

export interface RouteLeg {
  from: string;
  to: string;
  instruction: string;
}

export interface RoutePath {
  legs: RouteLeg[];
  transferPoints: string[];
  steps: string[];
}
