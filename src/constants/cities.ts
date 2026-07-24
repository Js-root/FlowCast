export interface CityConfig {
  id: string;
  name: string;
  center: [number, number];
  bbox: string;
  nodes: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    x: number; // Percentages on old canvas if fallback is used
    y: number;
  }[];
}

export const CITIES: Record<string, CityConfig> = {
  delhi: {
    id: 'delhi',
    name: 'Delhi NCR',
    center: [28.6139, 77.2090],
    bbox: '77.0,28.4,77.4,28.8',
    nodes: [
      { id: 'node-cp', name: 'Connaught Place', lat: 28.6315, lng: 77.2167, x: 48, y: 38 },
      { id: 'node-ring', name: 'Ring Road (Moti Bagh)', lat: 28.5822, lng: 77.1685, x: 38, y: 52 },
      { id: 'node-aiims', name: 'AIIMS Junction', lat: 28.5672, lng: 77.2100, x: 50, y: 64 },
      { id: 'node-ashram', name: 'Ashram Chowk', lat: 28.5714, lng: 77.2625, x: 62, y: 68 },
      { id: 'node-dnd', name: 'DND Flyway', lat: 28.5626, lng: 77.2917, x: 72, y: 58 },
      { id: 'node-nh44', name: 'NH44 (Mukarba Chowk)', lat: 28.7256, lng: 77.1128, x: 34, y: 18 },
      { id: 'node-karol', name: 'Karol Bagh', lat: 28.6475, lng: 77.1907, x: 40, y: 34 },
      { id: 'node-southdelhi', name: 'South Delhi (Saket)', lat: 28.5244, lng: 77.2066, x: 50, y: 78 },
      { id: 'node-noida', name: 'Noida Sec 18', lat: 28.5708, lng: 77.3261, x: 80, y: 52 },
      { id: 'node-gurgaon', name: 'Gurgaon Cyber City', lat: 28.4951, lng: 77.0894, x: 26, y: 82 },
      { id: 'node-yamuna', name: 'Yamuna Bridge (ITO)', lat: 28.6289, lng: 77.2410, x: 60, y: 42 },
      { id: 'node-kashmere', name: 'Kashmere Gate ISBT', lat: 28.6675, lng: 77.2285, x: 52, y: 26 },
    ],
  },
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    center: [19.0760, 72.8777],
    bbox: '72.7,18.8,73.1,19.3',
    nodes: [
      { id: 'node-mumbai-cst', name: 'CST Terminus', lat: 18.9400, lng: 72.8354, x: 45, y: 25 },
      { id: 'node-mumbai-bandra', name: 'Bandra Junction', lat: 19.0544, lng: 72.8402, x: 50, y: 45 },
      { id: 'node-mumbai-dadar', name: 'Dadar Chowk', lat: 19.0178, lng: 72.8478, x: 55, y: 35 },
      { id: 'node-mumbai-worli', name: 'Worli Sea Link Entrance', lat: 19.0230, lng: 72.8180, x: 40, y: 40 },
      { id: 'node-mumbai-kurla', name: 'Kurla East', lat: 19.0650, lng: 72.8790, x: 65, y: 55 },
      { id: 'node-mumbai-chembur', name: 'Chembur Naka', lat: 19.0620, lng: 72.9010, x: 75, y: 50 },
      { id: 'node-mumbai-powai', name: 'Powai Lake Crossing', lat: 19.1280, lng: 72.9080, x: 70, y: 70 },
      { id: 'node-mumbai-andheri', name: 'Andheri WEH Metro', lat: 19.1155, lng: 72.8562, x: 48, y: 65 },
      { id: 'node-mumbai-borivali', name: 'Borivali National Park', lat: 19.2300, lng: 72.8570, x: 52, y: 90 },
      { id: 'node-mumbai-vashi', name: 'Vashi Bridge Toll', lat: 19.0420, lng: 72.9910, x: 90, y: 42 },
    ],
  },
  bengaluru: {
    id: 'bengaluru',
    name: 'Bengaluru',
    center: [12.9716, 77.5946],
    bbox: '77.4,12.8,77.8,13.2',
    nodes: [
      { id: 'node-blr-silkboard', name: 'Silk Board Junction', lat: 12.9174, lng: 77.6228, x: 60, y: 75 },
      { id: 'node-blr-tinfactory', name: 'Tin Factory Bridge', lat: 13.0040, lng: 77.6750, x: 75, y: 35 },
      { id: 'node-blr-majestic', name: 'Majestic bus stand', lat: 12.9779, lng: 77.5729, x: 45, y: 48 },
      { id: 'node-blr-mgroad', name: 'MG Road Metro', lat: 12.9740, lng: 77.6085, x: 55, y: 50 },
      { id: 'node-blr-electronic', name: 'Electronic City Phase 1 Toll', lat: 12.8490, lng: 77.6620, x: 80, y: 95 },
      { id: 'node-blr-hebbal', name: 'Hebbal Flyover', lat: 13.0358, lng: 77.5971, x: 52, y: 15 },
      { id: 'node-blr-marathahalli', name: 'Marathahalli Bridge', lat: 12.9560, lng: 77.6980, x: 85, y: 62 },
      { id: 'node-blr-whitefield', name: 'Whitefield Hope Farm', lat: 12.9840, lng: 77.7520, x: 95, y: 45 },
      { id: 'node-blr-yeswanthpur', name: 'Yeswanthpur Junction', lat: 13.0230, lng: 77.5500, x: 30, y: 25 },
      { id: 'node-blr-koramangala', name: 'Koramangala Sony World', lat: 12.9340, lng: 77.6280, x: 62, y: 68 },
    ],
  },
};
