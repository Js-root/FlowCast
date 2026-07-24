import { IncidentCategory } from '../types';

export interface DemoScenario {
  title: string;
  area: string;
  category: IncidentCategory;
  delay: number;
  startsIn: number;
  desc: string;
  coords: { x: number; y: number };
  lat: number;
  lng: number;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    title: 'Monsoon Waterlogging & Pump Failure',
    area: 'Minto Road Bridge Underpass',
    category: 'waterlogging',
    delay: 52,
    startsIn: 12,
    desc: '1.8 feet water accumulation reported after torrential 20-minute cloudburst. Buses stalled near New Delhi Railway Station approach.',
    coords: { x: 50, y: 42 },
    lat: 28.6330,
    lng: 77.2200
  },
  {
    title: 'VVIP Delegation Convoy Movement',
    area: 'Sardar Patel Marg / Chanakyapuri',
    category: 'vip_movement',
    delay: 24,
    startsIn: 18,
    desc: '30-minute security traffic hold enforced between IGI Airport Express and Diplomatic Enclave.',
    coords: { x: 36, y: 58 },
    lat: 28.5930,
    lng: 77.1860
  },
  {
    title: 'Commercial Truck Breakdown & Fuel Spill',
    area: 'AIIMS Flyover Ramp towards Moti Bagh',
    category: 'collision',
    delay: 38,
    startsIn: 8,
    desc: 'Heavy axle breakdown blocking 2 central lanes on Ring Road. Diesel oil spill requires fire tender cleanup.',
    coords: { x: 50, y: 64 },
    lat: 28.5672,
    lng: 77.2100
  }
];
