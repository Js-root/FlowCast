import { Incident } from '../types';

// Jam impact-radius (meters) at "now" (t=0) and "+30 min" (t=1), by severity.
// ponytail: linear growth Now->+30; swap for graph propagation only if a demo ever needs it.
const BASE: Record<string, number> = { severe: 600, moderate: 400, low: 250 };
const MAX: Record<string, number> = { severe: 1600, moderate: 1000, low: 600 };

export function radiusAt(
  inc: Pick<Incident, 'severity' | 'confidencePercent'>,
  minutesAhead: number,
): number {
  const base = BASE[inc.severity] ?? 400;
  const max = MAX[inc.severity] ?? 1000;
  const t = Math.max(0, Math.min(30, minutesAhead)) / 30;
  const conf = (inc.confidencePercent ?? 90) / 100;
  return Math.round((base + (max - base) * t) * conf);
}
