import { Incident, TrafficNode, CameraFeed, SocialSignal, RouteOption } from '../types';

export const INITIAL_NODES: TrafficNode[] = [
  { id: 'node-cp', name: 'Connaught Place', status: 'severe', avgSpeedKmh: 14, delayMinutes: 28, lat: 28.6315, lng: 77.2167 },
  { id: 'node-ring', name: 'Ring Road (Moti Bagh)', status: 'heavy', avgSpeedKmh: 22, delayMinutes: 18, lat: 28.5760, lng: 77.1740 },
  { id: 'node-aiims', name: 'AIIMS Junction', status: 'severe', avgSpeedKmh: 12, delayMinutes: 34, lat: 28.5672, lng: 77.2100 },
  { id: 'node-ashram', name: 'Ashram Chowk', status: 'heavy', avgSpeedKmh: 18, delayMinutes: 22, lat: 28.5730, lng: 77.2590 },
  { id: 'node-dnd', name: 'DND Flyway', status: 'heavy', avgSpeedKmh: 28, delayMinutes: 18, lat: 28.5680, lng: 77.3010 },
  { id: 'node-nh44', name: 'NH44 (Mukarba Chowk)', status: 'severe', avgSpeedKmh: 16, delayMinutes: 45, lat: 28.7370, lng: 77.1600 },
  { id: 'node-karol', name: 'Karol Bagh', status: 'moderate', avgSpeedKmh: 31, delayMinutes: 10, lat: 28.6512, lng: 77.1907 },
  { id: 'node-southdelhi', name: 'South Delhi (Saket)', status: 'clear', avgSpeedKmh: 42, delayMinutes: 4, lat: 28.5245, lng: 77.2066 },
  { id: 'node-noida', name: 'Noida Sec 18', status: 'moderate', avgSpeedKmh: 36, delayMinutes: 8, lat: 28.5700, lng: 77.3210 },
  { id: 'node-gurgaon', name: 'Gurgaon Cyber City', status: 'moderate', avgSpeedKmh: 38, delayMinutes: 12, lat: 28.4945, lng: 77.0880 },
  { id: 'node-yamuna', name: 'Yamuna Bridge (ITO)', status: 'heavy', avgSpeedKmh: 20, delayMinutes: 24, lat: 28.6289, lng: 77.2410 },
  { id: 'node-kashmere', name: 'Kashmere Gate ISBT', status: 'moderate', avgSpeedKmh: 29, delayMinutes: 11, lat: 28.6675, lng: 77.2281 },
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
    lat: 28.6315,
    lng: 77.2167,
    cascadingRoads: ['Barakhamba Road', 'Janpath', 'Radial Road 1', 'Minto Road']
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
    lat: 28.7256,
    lng: 77.1128,
    cascadingRoads: ['Mukarba Chowk', 'GT Karnal Road', 'Azadpur Underpass']
  },
  {
    id: 'inc-3',
    title: 'DND Flyway Heavy Toll Congestion',
    area: 'Mayur Vihar Side Toll Plaza',
    severity: 'heavy' as any,
    category: 'signal_failure',
    delayMinutes: 18,
    startsInMinutes: 15,
    confidencePercent: 89,
    socialSource: 'FASTag Sensor Anomaly + X Posts',
    description: 'Automatic barrier malfunction at lanes 3 & 4 causing 1.2km tailback entering South Delhi from Noida.',
    lat: 28.5905,
    lng: 77.3020,
    cascadingRoads: ['Mayur Vihar Link Road', 'Noida-Greater Noida Expressway']
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
    lat: 28.5915,
    lng: 77.1610,
    cascadingRoads: ['Sardar Patel Marg', 'Dhaula Kuan Flyover', 'Ring Road South']
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
    lat: 28.6260,
    lng: 77.3260,
    cascadingRoads: ['Delhi-Meerut Expressway', 'Anand Vihar ISBT Road']
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

export const PRESET_ROUTES: RouteOption[] = [
  {
    id: 'route-opt-1',
    name: 'Option 1: Barakhamba - Pragati Maidan Bypass',
    distanceKm: 18.4,
    normalTimeMins: 25,
    predictedTimeMins: 29,
    delayMins: 4,
    isAiRecommended: true,
    congestionPoints: ['Pragathi Maidan Tunnel (Clear)', 'Mathura Road (Moderate)'],
    sparklineData: [12, 14, 18, 16, 20, 24, 22, 18, 15],
    viaRoads: 'Via Pragati Tunnel & Mathura Road'
  },
  {
    id: 'route-opt-2',
    name: 'Option 2: Direct Ring Road (Standard Maps)',
    distanceKm: 16.2,
    normalTimeMins: 22,
    predictedTimeMins: 50,
    delayMins: 28,
    isAiRecommended: false,
    congestionPoints: ['CP Inner Circle (Severe)', 'AIIMS Junction (Severe)'],
    sparklineData: [20, 28, 42, 55, 62, 58, 52, 48, 45],
    viaRoads: 'Via Outer Ring Road & Regal Circle'
  },
  {
    id: 'route-opt-3',
    name: 'Option 3: Lodi Road & August Kranti Marg',
    distanceKm: 19.8,
    normalTimeMins: 28,
    predictedTimeMins: 34,
    delayMins: 6,
    isAiRecommended: false,
    congestionPoints: ['Lodi Flyover (Light)', 'Andrews Ganj (Moderate)'],
    sparklineData: [15, 18, 22, 25, 28, 26, 24, 22, 20],
    viaRoads: 'Via Lodi Estate & Khel Gaon Marg'
  }
];
