import { RouteOption } from '../types';

export const INCIDENT_ROUTES: Record<string, RouteOption[]> = {
  'inc-1': [
    {
      id: 'rt-cp-ai',
      name: 'Option 1: Barakhamba - Pragati Maidan Bypass',
      distanceKm: 8.5,
      normalTimeMins: 25,
      predictedTimeMins: 29,
      delayMins: 4,
      isAiRecommended: true,
      congestionPoints: ['Ashram Chowk (Light Traffic)'],
      sparklineData: [12, 14, 18, 15, 12],
      viaRoads: 'Pragati Tunnel & Mathura Road',
      etaMinutes: 29,
      predictedDelayMinutes: 4,
      savedMinutes: 21,
      risk: 'low',
      arrivalProbability: 96,
      polylinePositions: [
        [28.6315, 77.2167],
        [28.6280, 77.2300],
        [28.6180, 77.2430],
        [28.6050, 77.2480],
        [28.5714, 77.2625]
      ]
    },
    {
      id: 'rt-cp-standard',
      name: 'Option 2: Direct Ring Road (Standard Maps)',
      distanceKm: 10.2,
      normalTimeMins: 22,
      predictedTimeMins: 50,
      delayMins: 28,
      isAiRecommended: false,
      congestionPoints: ['Connaught Place (Gridlock)', 'AIIMS Flyover (Heavy)'],
      sparklineData: [20, 35, 50, 55, 60],
      viaRoads: 'Inner Ring Road',
      etaMinutes: 50,
      predictedDelayMinutes: 28,
      savedMinutes: 0,
      risk: 'high',
      arrivalProbability: 48,
      polylinePositions: [
        [28.6315, 77.2167],
        [28.6100, 77.2100],
        [28.5850, 77.2050],
        [28.5714, 77.2625]
      ]
    },
    {
      id: 'rt-cp-alternative',
      name: 'Option 3: Lodi Road Corridor',
      distanceKm: 9.0,
      normalTimeMins: 28,
      predictedTimeMins: 34,
      delayMins: 6,
      isAiRecommended: false,
      congestionPoints: ['Lodi Road (Moderate)'],
      sparklineData: [15, 18, 22, 25, 20],
      viaRoads: 'Lodi Road & August Kranti Marg',
      etaMinutes: 34,
      predictedDelayMinutes: 6,
      savedMinutes: 16,
      risk: 'medium',
      arrivalProbability: 88,
      polylinePositions: [
        [28.6315, 77.2167],
        [28.6150, 77.2220],
        [28.5900, 77.2250],
        [28.5714, 77.2625]
      ]
    }
  ],
  'inc-2': [
    {
      id: 'rt-nh-ai',
      name: 'Option 1: Outer Ring Road - Wazirabad Bypass',
      distanceKm: 12.5,
      normalTimeMins: 27,
      predictedTimeMins: 32,
      delayMins: 5,
      isAiRecommended: true,
      congestionPoints: ['Signature Bridge (Clear)'],
      sparklineData: [10, 15, 12, 14, 15],
      viaRoads: 'Wazirabad Road & Signature Bridge',
      etaMinutes: 32,
      predictedDelayMinutes: 5,
      savedMinutes: 35,
      risk: 'low',
      arrivalProbability: 94,
      polylinePositions: [
        [28.7256, 77.1128],
        [28.7200, 77.1500],
        [28.7050, 77.2000],
        [28.6900, 77.2300],
        [28.6675, 77.2285]
      ]
    },
    {
      id: 'rt-nh-standard',
      name: 'Option 2: Direct GT Karnal Road',
      distanceKm: 9.8,
      normalTimeMins: 22,
      predictedTimeMins: 67,
      delayMins: 45,
      isAiRecommended: false,
      congestionPoints: ['Jahangirpuri Underpass (Flooded)', 'Azadpur (Gridlock)'],
      sparklineData: [30, 48, 62, 65, 68],
      viaRoads: 'Mukarba Chowk & Azadpur',
      etaMinutes: 67,
      predictedDelayMinutes: 45,
      savedMinutes: 0,
      risk: 'high',
      arrivalProbability: 35,
      polylinePositions: [
        [28.7256, 77.1128],
        [28.7050, 77.1250],
        [28.6850, 77.1450],
        [28.6675, 77.2285]
      ]
    },
    {
      id: 'rt-nh-alternative',
      name: 'Option 3: Ring Road West Corridor',
      distanceKm: 14.2,
      normalTimeMins: 32,
      predictedTimeMins: 44,
      delayMins: 12,
      isAiRecommended: false,
      congestionPoints: ['Punjabi Bagh Flyover (Slow)'],
      sparklineData: [20, 24, 28, 30, 32],
      viaRoads: 'Punjabi Bagh & Shakurpur',
      etaMinutes: 44,
      predictedDelayMinutes: 12,
      savedMinutes: 23,
      risk: 'medium',
      arrivalProbability: 82,
      polylinePositions: [
        [28.7256, 77.1128],
        [28.6900, 77.1150],
        [28.6700, 77.1280],
        [28.6675, 77.2285]
      ]
    }
  ],
  'inc-3': [
    {
      id: 'rt-dnd-ai',
      name: 'Option 1: Noida-Link Bridge Bypass',
      distanceKm: 7.2,
      normalTimeMins: 22,
      predictedTimeMins: 25,
      delayMins: 3,
      isAiRecommended: true,
      congestionPoints: ['Akshardham Route (Fluent)'],
      sparklineData: [8, 12, 10, 11, 12],
      viaRoads: 'Mayur Vihar Link Road & Nizamuddin',
      etaMinutes: 25,
      predictedDelayMinutes: 3,
      savedMinutes: 15,
      risk: 'low',
      arrivalProbability: 97,
      polylinePositions: [
        [28.5626, 77.2917],
        [28.5800, 77.2800],
        [28.5900, 77.2600],
        [28.5714, 77.2625]
      ]
    },
    {
      id: 'rt-dnd-standard',
      name: 'Option 2: Direct DND Flyway',
      distanceKm: 6.0,
      normalTimeMins: 22,
      predictedTimeMins: 40,
      delayMins: 18,
      isAiRecommended: false,
      congestionPoints: ['DND Toll Plaza (Malfunction)'],
      sparklineData: [15, 25, 38, 42, 45],
      viaRoads: 'DND Main Toll Lanes',
      etaMinutes: 40,
      predictedDelayMinutes: 18,
      savedMinutes: 0,
      risk: 'high',
      arrivalProbability: 58,
      polylinePositions: [
        [28.5626, 77.2917],
        [28.5600, 77.2600],
        [28.5714, 77.2625]
      ]
    },
    {
      id: 'rt-dnd-alternative',
      name: 'Option 3: Kalindi Kunj Corridor',
      distanceKm: 9.5,
      normalTimeMins: 25,
      predictedTimeMins: 32,
      delayMins: 7,
      isAiRecommended: false,
      congestionPoints: ['Okhla Barrage (Moderate)'],
      sparklineData: [18, 22, 25, 28, 26],
      viaRoads: 'Okhla Barrage & Mathura Road',
      etaMinutes: 32,
      predictedDelayMinutes: 7,
      savedMinutes: 8,
      risk: 'medium',
      arrivalProbability: 86,
      polylinePositions: [
        [28.5626, 77.2917],
        [28.5400, 77.2950],
        [28.5450, 77.2700],
        [28.5714, 77.2625]
      ]
    }
  ],
  'inc-4': [
    {
      id: 'rt-sp-ai',
      name: 'Option 1: Ring Road South Bypass',
      distanceKm: 6.8,
      normalTimeMins: 20,
      predictedTimeMins: 22,
      delayMins: 2,
      isAiRecommended: true,
      congestionPoints: ['Dhaula Kuan Loop (Fluent)'],
      sparklineData: [5, 8, 10, 8, 9],
      viaRoads: 'Moti Bagh & Benito Juarez Marg',
      etaMinutes: 22,
      predictedDelayMinutes: 2,
      savedMinutes: 15,
      risk: 'low',
      arrivalProbability: 98,
      polylinePositions: [
        [28.5930, 77.1860],
        [28.5750, 77.1700],
        [28.5650, 77.1850],
        [28.5672, 77.2100]
      ]
    },
    {
      id: 'rt-sp-standard',
      name: 'Option 2: Direct SP Marg Corridor',
      distanceKm: 5.5,
      normalTimeMins: 22,
      predictedTimeMins: 37,
      delayMins: 15,
      isAiRecommended: false,
      congestionPoints: ['Sardar Patel Marg (Security Block)'],
      sparklineData: [22, 28, 35, 38, 40],
      viaRoads: 'Sardar Patel Marg Main',
      etaMinutes: 37,
      predictedDelayMinutes: 15,
      savedMinutes: 0,
      risk: 'high',
      arrivalProbability: 62,
      polylinePositions: [
        [28.5930, 77.1860],
        [28.5850, 77.1950],
        [28.5672, 77.2100]
      ]
    },
    {
      id: 'rt-sp-alternative',
      name: 'Option 3: Shanti Path Corridor',
      distanceKm: 5.9,
      normalTimeMins: 20,
      predictedTimeMins: 24,
      delayMins: 4,
      isAiRecommended: false,
      congestionPoints: ['Chanakyapuri (Light)'],
      sparklineData: [8, 10, 12, 11, 10],
      viaRoads: 'Diplomatic Enclave & Chanakyapuri',
      etaMinutes: 24,
      predictedDelayMinutes: 4,
      savedMinutes: 13,
      risk: 'low',
      arrivalProbability: 92,
      polylinePositions: [
        [28.5930, 77.1860],
        [28.5880, 77.2000],
        [28.5672, 77.2100]
      ]
    }
  ],
  'inc-5': [
    {
      id: 'rt-gz-ai',
      name: 'Option 1: Anand Vihar Bypass',
      distanceKm: 9.2,
      normalTimeMins: 23,
      predictedTimeMins: 28,
      delayMins: 5,
      isAiRecommended: true,
      congestionPoints: ['Road 56 (Clear)'],
      sparklineData: [9, 14, 15, 12, 10],
      viaRoads: 'Maharajpur Border & Road 56',
      etaMinutes: 28,
      predictedDelayMinutes: 5,
      savedMinutes: 32,
      risk: 'low',
      arrivalProbability: 93,
      polylinePositions: [
        [28.6247, 77.3275],
        [28.6400, 77.3200],
        [28.6500, 77.3000],
        [28.6675, 77.2285]
      ]
    },
    {
      id: 'rt-gz-standard',
      name: 'Option 2: Direct Expressway',
      distanceKm: 8.0,
      normalTimeMins: 22,
      predictedTimeMins: 60,
      delayMins: 38,
      isAiRecommended: false,
      congestionPoints: ['Ghazipur Toll (Protest barricades)'],
      sparklineData: [25, 45, 55, 60, 62],
      viaRoads: 'Delhi-Meerut Expressway',
      etaMinutes: 60,
      predictedDelayMinutes: 38,
      savedMinutes: 0,
      risk: 'high',
      arrivalProbability: 30,
      polylinePositions: [
        [28.6247, 77.3275],
        [28.6300, 77.2800],
        [28.6675, 77.2285]
      ]
    },
    {
      id: 'rt-gz-alternative',
      name: 'Option 3: Kaushambi Corridor',
      distanceKm: 8.5,
      normalTimeMins: 25,
      predictedTimeMins: 33,
      delayMins: 8,
      isAiRecommended: false,
      congestionPoints: ['Kaushambi Link Road (Moderate)'],
      sparklineData: [12, 18, 22, 25, 20],
      viaRoads: 'Kaushambi Link Road',
      etaMinutes: 33,
      predictedDelayMinutes: 8,
      savedMinutes: 27,
      risk: 'medium',
      arrivalProbability: 85,
      polylinePositions: [
        [28.6247, 77.3275],
        [28.6350, 77.3100],
        [28.6675, 77.2285]
      ]
    }
  ],
  'fake-chanakyapuri': [
    {
      id: 'rt-fake-ai',
      name: 'Option 1: Shanti Path Bypass',
      distanceKm: 5.0,
      normalTimeMins: 18,
      predictedTimeMins: 20,
      delayMins: 2,
      isAiRecommended: true,
      congestionPoints: ['Shanti Path (Fluent)'],
      sparklineData: [6, 8, 9, 8, 7],
      viaRoads: 'Shanti Path & Niti Marg',
      etaMinutes: 20,
      predictedDelayMinutes: 2,
      savedMinutes: 20,
      risk: 'low',
      arrivalProbability: 98,
      polylinePositions: [
        [28.5930, 77.1860],
        [28.5880, 77.1950],
        [28.5672, 77.2100]
      ]
    },
    {
      id: 'rt-fake-standard',
      name: 'Option 2: Direct Chanakyapuri Route',
      distanceKm: 5.5,
      normalTimeMins: 20,
      predictedTimeMins: 40,
      delayMins: 20,
      isAiRecommended: false,
      congestionPoints: ['Sardar Patel Marg (Cave-In blockage)'],
      sparklineData: [20, 32, 38, 42, 40],
      viaRoads: 'Sardar Patel Marg & Cave-in zone',
      etaMinutes: 40,
      predictedDelayMinutes: 20,
      savedMinutes: 0,
      risk: 'high',
      arrivalProbability: 45,
      polylinePositions: [
        [28.5930, 77.1860],
        [28.5850, 77.1900],
        [28.5672, 77.2100]
      ]
    },
    {
      id: 'rt-fake-alternative',
      name: 'Option 3: Ring Road South Bypass',
      distanceKm: 6.8,
      normalTimeMins: 18,
      predictedTimeMins: 22,
      delayMins: 4,
      isAiRecommended: false,
      congestionPoints: ['Moti Bagh Corridor (Light traffic)'],
      sparklineData: [8, 12, 10, 11, 12],
      viaRoads: 'Moti Bagh Corridor',
      etaMinutes: 22,
      predictedDelayMinutes: 4,
      savedMinutes: 18,
      risk: 'low',
      arrivalProbability: 95,
      polylinePositions: [
        [28.5930, 77.1860],
        [28.5750, 77.1700],
        [28.5672, 77.2100]
      ]
    }
  ]
};
