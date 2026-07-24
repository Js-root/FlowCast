import assert from 'node:assert';
import { radiusAt } from './forecast';

const severe = { severity: 'severe' as const, confidencePercent: 100 };
const low = { severity: 'low' as const, confidencePercent: 100 };

// grows with horizon
assert(radiusAt(severe, 30) > radiusAt(severe, 0), 'radius must grow Now->+30');
assert(radiusAt(severe, 0) > 0, 'radius positive at now');
// severity ordering
assert(radiusAt(severe, 30) > radiusAt(low, 30), 'severe wider than low');
// confidence scales
assert(
  radiusAt({ severity: 'severe', confidencePercent: 50 }, 30) <
    radiusAt(severe, 30),
  'lower confidence -> smaller radius',
);

console.log('forecast.test ok');
