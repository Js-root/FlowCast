import { Incident, SocialSignal, TrafficNode } from '../types';

export type Verification = 'confirmed' | 'unverified';

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const tokens = (s: string): string[] => s.toLowerCase().match(/[a-z]{4,}/g) ?? [];

// Count independent social signals that reference this incident's area/title.
export function matchingSignals(inc: Incident, signals: SocialSignal[]): number {
  const key = new Set([...tokens(inc.area), ...tokens(inc.title)]);
  return signals.filter((s) => tokens(`${s.impactArea} ${s.text}`).some((w) => key.has(w))).length;
}

// Cross-validation gate: Confirmed if >=2 corroborating signals OR a nearby node
// shows a real speed drop (severe/heavy within 2.5 km). Otherwise Unverified.
// ponytail: token-overlap match + 2.5km radius are tuned heuristics; swap for
// real entity-linking + GPS correlation in Phase 2.
export function verifyIncident(
  inc: Incident,
  signals: SocialSignal[],
  nodes: TrafficNode[],
): Verification {
  const sigs = matchingSignals(inc, signals);
  const nodeDrop = nodes.some(
    (n) => (n.status === 'severe' || n.status === 'heavy') && haversineKm(n, inc) <= 2.5,
  );
  return sigs >= 2 || nodeDrop ? 'confirmed' : 'unverified';
}
