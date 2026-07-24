import assert from 'node:assert';
import { verifyIncident } from './verify';
import type { Incident, SocialSignal, TrafficNode } from '../types';

const base: Omit<Incident, 'lat' | 'lng' | 'title' | 'area'> = {
  id: 'x', severity: 'severe', category: 'collision', delayMinutes: 20,
  startsInMinutes: 10, confidencePercent: 90, socialSource: '', description: '',
  cascadingRoads: [],
};

const inc = (title: string, area: string, lat: number, lng: number): Incident =>
  ({ ...base, title, area, lat, lng });

const sig = (impactArea: string, text = ''): SocialSignal =>
  ({ id: 's', timeAgo: '', platform: 'X / Twitter', handle: '', text,
     sentiment: 'warning', reliabilityScore: 90, impactArea });

const node = (status: TrafficNode['status'], lat: number, lng: number): TrafficNode =>
  ({ id: 'n', name: '', status, avgSpeedKmh: 10, delayMinutes: 10, lat, lng });

// Lone signal, no nearby severe node -> unverified (the fake-news case)
assert.equal(
  verifyIncident(inc('Fake protest', 'Karol Bagh', 28.6512, 77.1907), [sig('Karol Bagh')], [node('clear', 28.65, 77.19)]),
  'unverified',
);
// Two corroborating signals -> confirmed
assert.equal(
  verifyIncident(inc('CP collision', 'Connaught Place', 28.6315, 77.2167),
    [sig('Connaught Place'), sig('somewhere', 'jam at connaught place')], []),
  'confirmed',
);
// One signal but nearby severe node -> confirmed (GPS corroboration)
assert.equal(
  verifyIncident(inc('CP collision', 'Connaught Place', 28.6315, 77.2167),
    [sig('Connaught Place')], [node('severe', 28.6320, 77.2170)]),
  'confirmed',
);

console.log('verify.test ok');
