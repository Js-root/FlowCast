import assert from 'assert';
import { radiusAt, severityToColor } from './radiusAt';
import { Incident } from '../types';

// Mock Incident factory
function createMockIncident(severity: 'severe' | 'heavy' | 'moderate', confidence: number): Incident {
  return {
    id: 'test-inc',
    title: 'Test Incident',
    area: 'Test Area',
    severity,
    category: 'collision',
    delayMinutes: 20,
    startsInMinutes: 10,
    confidencePercent: confidence,
    socialSource: 'Test Source',
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

console.log('Running radiusAt.test.ts...');

try {
  // Test 1: Severity sizing Hierarchy at T = 0
  const severeInc = createMockIncident('severe', 100);
  const heavyInc = createMockIncident('heavy', 100);
  const moderateInc = createMockIncident('moderate', 100);

  const radSevere = radiusAt(severeInc, 0);
  const radHeavy = radiusAt(heavyInc, 0);
  const radMod = radiusAt(moderateInc, 0);

  assert.strictEqual(radSevere, 600, 'Severe base radius should be 600m');
  assert.strictEqual(radHeavy, 400, 'Heavy base radius should be 400m');
  assert.strictEqual(radMod, 200, 'Moderate base radius should be 200m');
  assert.ok(radSevere > radHeavy, 'Severe radius must exceed heavy radius');
  assert.ok(radHeavy > radMod, 'Heavy radius must exceed moderate radius');

  // Test 2: Growth with forecast horizon T
  const radSevere30 = radiusAt(severeInc, 30);
  assert.strictEqual(radSevere30, 900, 'Severe radius at T=30 should be 900m (1.5x base)');
  assert.ok(radSevere30 > radSevere, 'Radius must grow as T increases');

  // Test 3: Scaling by confidence factor
  const severe50Inc = createMockIncident('severe', 50);
  const radSevere50 = radiusAt(severe50Inc, 0);
  assert.strictEqual(radSevere50, 300, 'Radius should scale linearly with confidence (50% of 600 = 300)');

  // Test 4: Colors mapping
  assert.strictEqual(severityToColor('severe'), '#D93B2D');
  assert.strictEqual(severityToColor('heavy'), '#D97706');
  assert.strictEqual(severityToColor('moderate'), '#2563EB');

  console.log('✓ All radiusAt tests passed successfully!');
} catch (error) {
  console.error('✗ radiusAt tests failed!');
  console.error(error);
  process.exit(1);
}
