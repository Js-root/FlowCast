import { Incident, TrafficNode, CameraFeed, SocialSignal, RouteOption } from '../types';

export const INITIAL_NODES: TrafficNode[] = [
  { id: 'node-cp', name: 'Connaught Place', status: 'severe', avgSpeedKmh: 14, delayMinutes: 28, coords: { x: 48, y: 38 }, lat: 28.6315, lng: 77.2167 },
  { id: 'node-ring', name: 'Ring Road (Moti Bagh)', status: 'heavy', avgSpeedKmh: 22, delayMinutes: 18, coords: { x: 38, y: 52 }, lat: 28.5822, lng: 77.1685 },
  { id: 'node-aiims', name: 'AIIMS Junction', status: 'severe', avgSpeedKmh: 12, delayMinutes: 34, coords: { x: 50, y: 64 }, lat: 28.5672, lng: 77.2100 },
  { id: 'node-ashram', name: 'Ashram Chowk', status: 'heavy', avgSpeedKmh: 18, delayMinutes: 22, coords: { x: 62, y: 68 }, lat: 28.5714, lng: 77.2625 },
  { id: 'node-dnd', name: 'DND Flyway', status: 'heavy', avgSpeedKmh: 28, delayMinutes: 18, coords: { x: 72, y: 58 }, lat: 28.5626, lng: 77.2917 },
  { id: 'node-nh44', name: 'NH44 (Mukarba Chowk)', status: 'severe', avgSpeedKmh: 16, delayMinutes: 45, coords: { x: 34, y: 18 }, lat: 28.7256, lng: 77.1128 },
  { id: 'node-karol', name: 'Karol Bagh', status: 'moderate', avgSpeedKmh: 31, delayMinutes: 10, coords: { x: 40, y: 34 }, lat: 28.6475, lng: 77.1907 },
  { id: 'node-southdelhi', name: 'South Delhi (Saket)', status: 'clear', avgSpeedKmh: 42, delayMinutes: 4, coords: { x: 50, y: 78 }, lat: 28.5244, lng: 77.2066 },
  { id: 'node-noida', name: 'Noida Sec 18', status: 'moderate', avgSpeedKmh: 36, delayMinutes: 8, coords: { x: 80, y: 52 }, lat: 28.5708, lng: 77.3261 },
  { id: 'node-gurgaon', name: 'Gurgaon Cyber City', status: 'moderate', avgSpeedKmh: 38, delayMinutes: 12, coords: { x: 26, y: 82 }, lat: 28.4951, lng: 77.0894 },
  { id: 'node-yamuna', name: 'Yamuna Bridge (ITO)', status: 'heavy', avgSpeedKmh: 20, delayMinutes: 24, coords: { x: 60, y: 42 }, lat: 28.6289, lng: 77.2410 },
  { id: 'node-kashmere', name: 'Kashmere Gate ISBT', status: 'moderate', avgSpeedKmh: 29, delayMinutes: 11, coords: { x: 52, y: 26 }, lat: 28.6675, lng: 77.2285 },
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    title: 'Connaught Place Vehicle Collision',
    area: 'Inner Circle near Regal Cinema',
    severity: 'severe',
    category: 'collision',
    delayMinutes: 28,
    startsInMinutes: 24,
    confidencePercent: 94,
    socialSource: '@dtptraffic + 14 Tweets',
    description: 'Two commercial vehicles stalled after a multi-car fender bender blocking 2 lanes. Spillover expected along Barakhamba & Janpath.',
    coords: { x: 48, y: 38 },
    lat: 28.6315,
    lng: 77.2167,
    cascadingRoads: ['Barakhamba Road', 'Janpath', 'Radial Road 1', 'Minto Road'],
    affectedRoads: ['Outer Circle', 'Radial Road 1', 'Janpath'],
    verificationStatus: 'confirmed',
    sourcesCount: 15
  },
  {
    id: 'inc-2',
    title: 'NH44 Waterlogging & Underpass Overflow',
    area: 'Jahangirpuri Underpass',
    severity: 'severe',
    category: 'waterlogging',
    delayMinutes: 45,
    startsInMinutes: 10,
    confidencePercent: 98,
    socialSource: 'IMD Rain Alert + Citizen Live Uploads',
    description: 'Sudden intense downpour caused 1.5 ft water accumulation. Slow movement towards Azadpur Mandi and Mukarba Chowk.',
    coords: { x: 34, y: 18 },
    lat: 28.7256,
    lng: 77.1128,
    cascadingRoads: ['Mukarba Chowk', 'GT Karnal Road', 'Azadpur Underpass'],
    affectedRoads: ['GT Karnal Road', 'Azadpur Underpass'],
    verificationStatus: 'confirmed',
    sourcesCount: 24
  },
  {
    id: 'inc-3',
    title: 'DND Flyway Heavy Toll Congestion',
    area: 'Mayur Vihar Side Toll Plaza',
    severity: 'heavy',
    category: 'signal_failure',
    delayMinutes: 18,
    startsInMinutes: 15,
    confidencePercent: 89,
    socialSource: 'FASTag Sensor Anomaly + X Posts',
    description: 'Automatic barrier malfunction at lanes 3 & 4 causing 1.2km tailback entering South Delhi from Noida.',
    coords: { x: 72, y: 58 },
    lat: 28.5626,
    lng: 77.2917,
    cascadingRoads: ['Mayur Vihar Link Road', 'Noida-Greater Noida Expressway'],
    affectedRoads: ['DND Flyway Toll Lanes', 'Noida Link Road'],
    verificationStatus: 'confirmed',
    sourcesCount: 8
  },
  {
    id: 'inc-4',
    title: 'VVIP Movement & Convoy Diversion',
    area: 'Sardar Patel Marg / Dhaula Kuan',
    severity: 'moderate',
    category: 'vip_movement',
    delayMinutes: 15,
    startsInMinutes: 30,
    confidencePercent: 96,
    socialSource: 'Delhi Police Circular #402',
    description: 'Temporary traffic hold expected for diplomatic delegation movement between Airport Express Corridor and Chanakyapuri.',
    coords: { x: 36, y: 58 },
    lat: 28.5930,
    lng: 77.1860,
    cascadingRoads: ['Sardar Patel Marg', 'Dhaula Kuan Flyover', 'Ring Road South'],
    affectedRoads: ['Sardar Patel Marg', 'Dhaula Kuan Loop'],
    verificationStatus: 'confirmed',
    sourcesCount: 2
  },
  {
    id: 'inc-5',
    title: 'Farmer Protest Assembly',
    area: 'Ghazipur Border Junction',
    severity: 'severe',
    category: 'rally',
    delayMinutes: 38,
    startsInMinutes: 5,
    confidencePercent: 92,
    socialSource: 'Police Control Room Signal',
    description: 'Peaceful rally assembly blocking right lane towards Anand Vihar. Heavy police barricading in place.',
    coords: { x: 82, y: 38 },
    lat: 28.6247,
    lng: 77.3275,
    cascadingRoads: ['Delhi-Meerut Expressway', 'Anand Vihar ISBT Road'],
    affectedRoads: ['Delhi-Meerut Expressway', 'Ghazipur Border Road'],
    verificationStatus: 'confirmed',
    sourcesCount: 14
  }
];

export const INITIAL_SOCIAL_SIGNALS: SocialSignal[] = [
  {
    id: 'sig-1',
    timeAgo: '2m ago',
    platform: 'Delhi Traffic Police',
    handle: '@dtptraffic',
    text: 'ALERT: Traffic is affected on Ring Road in the carriageway from AIIMS towards Moti Bagh due to vehicle breakdown. Drivers advised to take August Kranti Marg.',
    sentiment: 'warning',
    reliabilityScore: 99,
    impactArea: 'AIIMS Junction / Ring Road'
  },
  {
    id: 'sig-2',
    timeAgo: '4m ago',
    platform: 'X / Twitter',
    handle: '@delhicommuter_raj',
    text: 'Stuck near Connaught Place Outer Circle since 20 mins. Police tow truck just arrived near Regal Cinema. Avoid CP if heading to NDLS!',
    sentiment: 'negative',
    reliabilityScore: 91,
    impactArea: 'Connaught Place'
  },
  {
    id: 'sig-3',
    timeAgo: '7m ago',
    platform: 'Citizen Report',
    handle: '@noidadriver99',
    text: 'Water accumulation starting at Jahangirpuri underpass after heavy 15-minute cloudburst. Buses moving single lane.',
    sentiment: 'negative',
    reliabilityScore: 88,
    impactArea: 'NH44 Jahangirpuri'
  },
  {
    id: 'sig-4',
    timeAgo: '11m ago',
    platform: 'IMD Rain Warning',
    handle: '@imd_delhi',
    text: 'Moderate to heavy rain shower cells moving over North and West Delhi. Possible urban waterlogging in low-lying underpasses over next 30 mins.',
    sentiment: 'warning',
    reliabilityScore: 97,
    impactArea: 'North Delhi Corridor'
  },
  {
    id: 'sig-5',
    timeAgo: '15m ago',
    platform: 'Waze Signal',
    handle: 'Waze-Delhi-Bot',
    text: 'Speed dropped to 9 km/h on DND Toll Plaza approach. 182 drivers reported heavy congestion slowing down entry to Delhi.',
    sentiment: 'negative',
    reliabilityScore: 94,
    impactArea: 'DND Flyway'
  }
];

export const CAMERA_FEEDS: CameraFeed[] = [
  {
    id: 'cam-1',
    junctionName: 'AIIMS Flyover Circle',
    location: 'Ring Road / Aurobindo Marg Intersection',
    status: 'active',
    avgSpeed: 12,
    snapshotUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    lastUpdated: '15:34:02 IST'
  },
  {
    id: 'cam-2',
    junctionName: 'Connaught Place Radial 1',
    location: 'Barakhamba Road Entrance',
    status: 'active',
    avgSpeed: 14,
    snapshotUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
    lastUpdated: '15:34:05 IST'
  },
  {
    id: 'cam-3',
    junctionName: 'DND Toll Plaza Plaza 4',
    location: 'Noida to South Delhi Entry',
    status: 'active',
    avgSpeed: 28,
    snapshotUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
    lastUpdated: '15:33:58 IST'
  },
  {
    id: 'cam-4',
    junctionName: 'Ashram Flyover Underpass',
    location: 'Mathura Road Corner',
    status: 'degraded',
    avgSpeed: 18,
    snapshotUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
    lastUpdated: '15:33:45 IST'
  }
];

import { INCIDENT_ROUTES } from './incidentRoutes';
export const PRESET_ROUTES: RouteOption[] = INCIDENT_ROUTES['inc-1'];
