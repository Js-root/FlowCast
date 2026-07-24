import { Incident, SocialSignal, TrafficNode } from '../types';

/**
 * Counts how many social signals are related to a specific traffic incident.
 * Matches by explicit incidentId or by checking keyword overlaps in text/areas.
 */
export function getIncidentSignalCount(inc: Incident, signals: SocialSignal[]): number {
  return signals.filter(sig => {
    // 1. Explicit link
    if (sig.incidentId === inc.id) {
      return true;
    }

    // 2. Text keyword matching
    const areaLower = inc.area.toLowerCase();
    const titleLower = inc.title.toLowerCase();
    const sigText = sig.text.toLowerCase();
    const sigArea = sig.impactArea.toLowerCase();

    const landmarks = [
      'cp', 'connaught', 'ring road', 'moti bagh', 'aiims', 'ashram', 'dnd', 
      'nh44', 'mukarba', 'karol bagh', 'saket', 'noida', 'gurgaon', 'ito', 
      'yamuna bridge', 'kashmere gate', 'minto', 'chanakyapuri', 'sardar patel'
    ];

    for (const landmark of landmarks) {
      if (areaLower.includes(landmark) || titleLower.includes(landmark)) {
        if (sigText.includes(landmark) || sigArea.includes(landmark)) {
          return true;
        }
      }
    }
    return false;
  }).length;
}

/**
 * Determines whether an incident is Confirmed or remains an Unverified Warning.
 * Confirmed when matching signals >= 2 OR its associated traffic node is experiencing severe/heavy slow speed.
 */
export function isIncidentConfirmed(inc: Incident, signals: SocialSignal[], nodes: TrafficNode[]): boolean {
  const signalCount = getIncidentSignalCount(inc, signals);

  // Speed drop check: does this incident map to a node that is currently severe or heavy?
  const isNodeSlow = nodes.some(node => {
    const nodeNameLower = node.name.toLowerCase();
    const incAreaLower = inc.area.toLowerCase();
    const incTitleLower = inc.title.toLowerCase();
    return (node.status === 'severe' || node.status === 'heavy') &&
           (incAreaLower.includes(nodeNameLower) || incTitleLower.includes(nodeNameLower));
  });

  return signalCount >= 2 || isNodeSlow;
}

/**
 * Calculates a dynamic confidence score based on telemetry corroboration.
 */
export function getIncidentConfidence(inc: Incident, signals: SocialSignal[]): number {
  const signalCount = getIncidentSignalCount(inc, signals);

  if (signalCount === 0) {
    return Math.max(35, inc.confidencePercent - 20);
  } else if (signalCount === 1) {
    return inc.confidencePercent;
  } else {
    // 2 or more signals boost confidence
    return Math.min(99, inc.confidencePercent + 5);
  }
}
