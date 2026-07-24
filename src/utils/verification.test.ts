import assert from 'assert';
import { getIncidentSignalCount, isIncidentConfirmed, getIncidentConfidence } from './verification';
import { Incident, SocialSignal, TrafficNode } from '../types';

function createMockIncident(id: string, area: string, title: string): Incident {
  return {
    id,
    title,
    area,
    severity: 'heavy',
    category: 'collision',
    delayMinutes: 20,
    startsInMinutes: 10,
    confidencePercent: 80,
    socialSource: 'Test',
    description: 'Test Description',
    coords: { x: 50, y: 50 },
    lat: 28.6,
    lng: 77.2,
    cascadingRoads: [],
    affectedRoads: [],
    verificationStatus: 'confirmed',
    sourcesCount: 3
  };
}

function createMockSignal(id: string, text: string, impactArea: string, incidentId?: string): SocialSignal {
  return {
    id,
    timeAgo: 'Just now',
    platform: 'X / Twitter',
    handle: '@user',
    text,
    sentiment: 'warning',
    reliabilityScore: 90,
    impactArea,
    incidentId
  };
}

function createMockNode(name: string, status: 'clear' | 'moderate' | 'heavy' | 'severe'): TrafficNode {
  return {
    id: 'node-' + name.toLowerCase(),
    name,
    status,
    avgSpeedKmh: status === 'severe' ? 10 : 40,
    delayMinutes: status === 'severe' ? 30 : 0,
    coords: { x: 10, y: 10 },
    lat: 28.6,
    lng: 77.2
  };
}

console.log('Running verification.test.ts...');

try {
  const inc = createMockIncident('inc-cp', 'Inner Circle near Regal Cinema', 'Connaught Place Collision');

  // Test 1: Empty signals list
  const count0 = getIncidentSignalCount(inc, []);
  assert.strictEqual(count0, 0);
  assert.strictEqual(isIncidentConfirmed(inc, [], []), false, 'Should be unverified with 0 signals');
  assert.strictEqual(getIncidentConfidence(inc, []), 60, 'Confidence should drop by 20 with 0 signals');

  // Test 2: 1 matching signal
  const sig1 = createMockSignal('sig-1', 'Major breakdown at CP near Regal circle!', 'Connaught Place');
  const count1 = getIncidentSignalCount(inc, [sig1]);
  assert.strictEqual(count1, 1);
  assert.strictEqual(isIncidentConfirmed(inc, [sig1], []), false, 'Should be unverified with 1 signal');
  assert.strictEqual(getIncidentConfidence(inc, [sig1]), 80, 'Confidence should remain baseline with 1 signal');

  // Test 3: 2 matching signals (Confirmation)
  const sig2 = createMockSignal('sig-2', 'Accident at Connaught Place, traffic blocked!', 'CP Junction');
  const count2 = getIncidentSignalCount(inc, [sig1, sig2]);
  assert.strictEqual(count2, 2);
  assert.strictEqual(isIncidentConfirmed(inc, [sig1, sig2], []), true, 'Should be confirmed with 2 signals');
  assert.strictEqual(getIncidentConfidence(inc, [sig1, sig2]), 85, 'Confidence should get boosted by 5 with >= 2 signals');

  // Test 4: Confirmation via Node slowdown (even with 0 signals)
  const slowCpNode = createMockNode('Connaught Place', 'severe');
  assert.strictEqual(isIncidentConfirmed(inc, [], [slowCpNode]), true, 'Should be confirmed if node speed is severe');

  // Test 5: No confirmation if node is clear and signals < 2
  const clearCpNode = createMockNode('Connaught Place', 'clear');
  assert.strictEqual(isIncidentConfirmed(inc, [sig1], [clearCpNode]), false, 'Should not be confirmed if node is clear and 1 signal');

  console.log('✓ All verification tests passed successfully!');
} catch (error) {
  console.error('✗ verification tests failed!');
  console.error(error);
  process.exit(1);
}
