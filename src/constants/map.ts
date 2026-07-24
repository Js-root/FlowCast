export const DELHI_CENTER: [number, number] = [28.61, 77.22];
export const DELHI_NCR_BOUNDS: [[number, number], [number, number]] = [
  [28.20, 76.80],
  [28.95, 77.65]
];
export const DEFAULT_ZOOM = 11.5;
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 15;
export const TILE_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

// TomTom Traffic Flow tile layer — color-codes roads by live speed (green/yellow/red)
const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_API_KEY || '';
export const TRAFFIC_FLOW_TILE_URL = `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?tileSize=256&key=${TOMTOM_KEY}`;
