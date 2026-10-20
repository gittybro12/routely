export interface CarPark {
  id: string;
  name: string;
  zone: string;
  latitude: number;
  longitude: number;
  boardingLandmark?: string;
}

export type Coordinate = [longitude: number, latitude: number];
export type TransportMode = 'shared-taxi' | 'bus' | 'shuttle' | 'unknown';

export interface ConnectionDetails {
  transportMode?: TransportMode;
  boardingLandmark?: string;
  alightingLandmark?: string;
  serviceNotes?: string;
  verification?: {
    status: 'sample' | 'verified';
    source?: string;
    checkedBy?: string;
    checkedAt?: string;
  };
  geometry?: Coordinate[];
  geometrySource?: string;
}

export interface RouteDefinition extends ConnectionDetails {
  from: string;
  to: string;
  instruction: string;
}

export interface RouteLeg extends ConnectionDetails {
  from: string;
  to: string;
  instruction: string;
}

export interface RoutePath {
  legs: RouteLeg[];
  transferPoints: string[];
  steps: string[];
}
