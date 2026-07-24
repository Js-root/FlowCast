export type NavTab = 'dashboard' | 'route-planner' | 'documentation';

export type IncidentSeverity = 'severe' | 'heavy' | 'moderate' | 'low';
export type IncidentCategory = 'collision' | 'waterlogging' | 'rally' | 'signal_failure' | 'vip_movement' | 'construction';

export interface Incident {
  id: string;
  title: string;
  area: string;
  severity: IncidentSeverity;
  category: IncidentCategory;
  delayMinutes: number;
  startsInMinutes: number;
  confidencePercent: number;
  socialSource: string;
  description: string;
  coords: { x: number; y: number }; // Percentage coords on Delhi map canvas
  lat: number;
  lng: number;
  cascadingRoads: string[];
  affectedRoads: string[];
  verificationStatus: 'warning' | 'confirmed';
  sourcesCount: number;
}

export interface TrafficNode {
  id: string;
  name: string;
  status: 'clear' | 'moderate' | 'heavy' | 'severe';
  avgSpeedKmh: number;
  delayMinutes: number;
  coords: { x: number; y: number };
  lat: number;
  lng: number;
}

export interface CameraFeed {
  id: string;
  junctionName: string;
  location: string;
  status: 'active' | 'degraded' | 'offline';
  avgSpeed: number;
  snapshotUrl: string;
  lastUpdated: string;
}

export interface SocialSignal {
  id: string;
  timeAgo: string;
  platform: 'X / Twitter' | 'Delhi Traffic Police' | 'Citizen Report' | 'Waze Signal' | 'IMD Rain Warning';
  handle: string;
  text: string;
  sentiment: 'negative' | 'neutral' | 'warning';
  reliabilityScore: number;
  impactArea: string;
  incidentId?: string;
}

export interface RouteOption {
  id: string;
  name: string;
  distanceKm: number;
  normalTimeMins: number;
  predictedTimeMins: number;
  delayMins: number;
  isAiRecommended: boolean;
  congestionPoints: string[];
  sparklineData: number[];
  viaRoads: string;
  etaMinutes: number;
  predictedDelayMinutes: number;
  savedMinutes: number;
  risk: 'low' | 'medium' | 'high';
  arrivalProbability: number;
  polylinePositions: [number, number][];
}

export interface RouteQuery {
  origin: string;
  destination: string;
  forecastMinutesAhead: number;
}

export interface DispatchLogEntry {
  id: string;
  time: string;
  title: string;
  details: string;
  meta?: string;
  type: 'system' | 'alert' | 'deploy';
}

export interface RouteAnalysis {
  standardRoute: {
    distanceKm: number;
    etaMinutes: number;
    delayMinutes: number;
    polylinePositions: [number, number][];
    viaRoads: string;
  };
  aiRoute: {
    distanceKm: number;
    etaMinutes: number;
    delayMinutes: number;
    polylinePositions: [number, number][];
    viaRoads: string;
  };
  comparison: {
    savedMinutes: number;
    distanceDifference: number;
    delayMinutes: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  aiSummary: string;
  trafficMetrics: string;
}
