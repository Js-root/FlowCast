/**
 * Calculates the estimated number of vehicles impacted by an incident based on severity and confidence.
 */
export function calculateEstimatedVehicles(severity: string, confidencePercent: number): number {
  let baseCount = 500;
  if (severity === 'severe') {
    baseCount = 3500;
  } else if (severity === 'heavy') {
    baseCount = 1800;
  } else if (severity === 'moderate') {
    baseCount = 900;
  }
  
  const factor = 0.8 + (confidencePercent / 100) * 0.4;
  return Math.round(baseCount * factor);
}

/**
 * Computes the impact area in square kilometers given a radius in meters.
 */
export function calculateImpactRadiusSqKm(radiusMeters: number): number {
  const radiusKm = radiusMeters / 1000;
  const area = Math.PI * radiusKm * radiusKm;
  return Math.round(area * 100) / 100;
}

/**
 * Computes adjusted countdown in minutes until traffic disruption cascades, based on forecast timeline T.
 */
export function calculateStartsInMinutes(startsInMinutes: number, T: number): number {
  return Math.max(0, startsInMinutes - T);
}
