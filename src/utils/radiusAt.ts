import { Incident } from '../types';

/**
 * Computes the dynamic radius of an incident in meters.
 * Grows linearly with forecast horizon T (up to 30 mins) and scales by confidence percent.
 */
export function radiusAt(inc: Incident, T: number): number {
  let baseRadius = 200; // moderate/low
  if (inc.severity === 'severe') {
    baseRadius = 600;
  } else if (inc.severity === 'heavy') {
    baseRadius = 400;
  }

  const maxRadius = baseRadius * 1.5;
  const timeFactor = Math.min(30, Math.max(0, T)) / 30;
  const interpolatedRadius = baseRadius + (maxRadius - baseRadius) * timeFactor;
  const confidenceFactor = inc.confidencePercent / 100;

  return interpolatedRadius * confidenceFactor;
}

/**
 * Maps traffic severity levels to color hex codes.
 */
export function severityToColor(severity: string): string {
  switch (severity) {
    case 'severe':
      return '#D93B2D'; // Red
    case 'heavy':
      return '#D97706'; // Orange
    case 'moderate':
      return '#2563EB'; // Blue
    default:
      return '#059669'; // Green
  }
}
