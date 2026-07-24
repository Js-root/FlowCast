export type NavTab = 'dashboard' | 'route-planner' | 'about-ai' | 'documentation';

export type IncidentSeverity = 'severe' | 'moderate' | 'low';
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
  cascadingRoads: string[];
}

export interface TrafficNode {
  id: string;
  name: string;
  status: 'clear' | 'moderate' | 'heavy' | 'severe';
  avgSpeedKmh: number;
  delayMinutes: number;
  coords: { x: number; y: number };
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
}

export interface RouteQuery {
  origin: string;
  destination: string;
  forecastMinutesAhead: number;
}
