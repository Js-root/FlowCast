import React, { useEffect, useRef, useState } from 'react';
import { CameraFeed } from '../types';
import { ShieldAlert, Cpu } from 'lucide-react';

interface CameraFeedSimulatorProps {
  camera: CameraFeed;
}

interface TrackedVehicle {
  id: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  width: number;
  height: number;
  plate: string;
  speedKmh: number;
  isSpeeding: boolean;
  type: 'Sedan' | 'SUV' | 'Truck' | 'Bus';
  color: string;
}

interface ScannedRecord {
  id: string;
  timestamp: string;
  plate: string;
  speedKmh: number;
  isSpeeding: boolean;
  type: string;
}

// Generate realistic Indian license plates
const generateIndianPlate = (): string => {
  const states = ['DL', 'MH', 'KA', 'HR', 'UP', 'GJ'];
  const state = states[Math.floor(Math.random() * states.length)];
  const district = String(Math.floor(Math.random() * 10) + 1).padStart(2, '0');
  const letters = String.fromCharCode(
    65 + Math.floor(Math.random() * 26),
    65 + Math.floor(Math.random() * 26)
  );
  const number = String(Math.floor(Math.random() * 9000) + 1000);
  return `${state}-${district}-${letters}-${number}`;
};

export const CameraFeedSimulator: React.FC<CameraFeedSimulatorProps> = ({ camera }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scannedLogs, setScannedLogs] = useState<ScannedRecord[]>([]);
  const vehiclesRef = useRef<TrackedVehicle[]>([]);
  const speedLimit = camera.avgSpeed > 30 ? 50 : 35; // Custom speed limit based on node volume

  // Initialize tracked vehicles
  useEffect(() => {
    const types: ('Sedan' | 'SUV' | 'Truck' | 'Bus')[] = ['Sedan', 'SUV', 'Truck', 'Bus'];
    const colors = ['#10B981', '#06B6D4', '#F59E0B', '#EF4444'];
    
    const initialVehicles: TrackedVehicle[] = Array.from({ length: 4 }).map((_, i) => {
      const isSpeeding = Math.random() > 0.85;
      const speedKmh = isSpeeding
        ? speedLimit + Math.floor(Math.random() * 25) + 5
        : Math.max(12, camera.avgSpeed + Math.floor(Math.random() * 10) - 5);
        
      return {
        id: i,
        x: Math.random() * 300 + 50,
        y: Math.random() * 150 + 50,
        speedX: (Math.random() * 0.4 + 0.2) * (Math.random() > 0.5 ? 1 : -1),
        speedY: (Math.random() * 0.2 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
        width: Math.random() * 25 + 20,
        height: Math.random() * 15 + 15,
        plate: generateIndianPlate(),
        speedKmh,
        isSpeeding,
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[i % colors.length]
      };
    });
    vehiclesRef.current = initialVehicles;
  }, [camera, speedLimit]);

  // Canvas animation loop
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      const w = ctx.canvas.width;
      const h = ctx.canvas.height;

      // Draw Sci-Fi HUD grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.07)';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw perspective guidelines (road projection lanes)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.25, h);
      ctx.lineTo(w * 0.45, h * 0.3);
      ctx.moveTo(w * 0.75, h);
      ctx.lineTo(w * 0.55, h * 0.3);
      ctx.stroke();

      // Update and draw vehicles
      vehiclesRef.current.forEach((veh) => {
        // Move vehicle boundaries
        veh.x += veh.speedX;
        veh.y += veh.speedY;

        // Boundary bounce
        if (veh.x < 20 || veh.x + veh.width > w - 20) {
          veh.speedX = -veh.speedX;
        }
        if (veh.y < 30 || veh.y + veh.height > h - 30) {
          veh.speedY = -veh.speedY;
        }

        const borderCol = veh.isSpeeding ? '#EF4444' : '#10B981';

        // Draw Bounding Box Corners (AI style)
        ctx.strokeStyle = borderCol;
        ctx.lineWidth = 2;
        const pad = 4;
        const boxX = veh.x - pad;
        const boxY = veh.y - pad;
        const boxW = veh.width + pad * 2;
        const boxH = veh.height + pad * 2;

        // Draw box corners
        const len = 8;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(boxX, boxY + len); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + len, boxY);
        // Top-right
        ctx.moveTo(boxX + boxW - len, boxY); ctx.lineTo(boxX + boxW, boxY); ctx.lineTo(boxX + boxW, boxY + len);
        // Bottom-left
        ctx.moveTo(boxX, boxY + boxH - len); ctx.lineTo(boxX, boxY + boxH); ctx.lineTo(boxX + len, boxY + boxH);
        // Bottom-right
        ctx.moveTo(boxX + boxW - len, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH - len);
        ctx.stroke();

        // Semi-transparent overlay inside bounding box
        ctx.fillStyle = veh.isSpeeding ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.05)';
        ctx.fillRect(boxX, boxY, boxW, boxH);

        // Draw Optical Flow Vector arrow
        ctx.strokeStyle = veh.isSpeeding ? '#EF4444' : '#06B6D4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const startX = veh.x + veh.width / 2;
        const startY = veh.y + veh.height / 2;
        const flowLength = 25;
        const endX = startX + veh.speedX * flowLength;
        const endY = startY + veh.speedY * flowLength;
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Vector arrowhead
        const angle = Math.atan2(veh.speedY, veh.speedX);
        ctx.fillStyle = veh.isSpeeding ? '#EF4444' : '#06B6D4';
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 5 * Math.cos(angle - Math.PI / 6), endY - 5 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - 5 * Math.cos(angle + Math.PI / 6), endY - 5 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        // Bounding box HUD labels
        ctx.fillStyle = 'rgba(26, 26, 26, 0.85)';
        ctx.fillRect(boxX, boxY - 14, 75, 13);
        ctx.fillStyle = borderCol;
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`${veh.type} [${veh.speedKmh}KMH]`, boxX + 3, boxY - 5);
      });

      // Draw Laser Radar Sweep Line
      const scanY = (Math.sin(frame * 0.015) + 1) * 0.5 * h;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();

      // Laser glowing horizontal line
      const gradient = ctx.createLinearGradient(0, scanY - 4, 0, scanY + 4);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
      gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.22)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 4, w, 8);

      // Sci-fi HUD text parameters overlay
      ctx.fillStyle = 'rgba(26, 26, 26, 0.8)';
      ctx.fillRect(10, 10, 160, 48);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, 160, 48);

      ctx.fillStyle = '#10B981';
      ctx.font = '9px monospace';
      ctx.fillText(`ANPR SYSTEM: ONLINE`, 16, 21);
      ctx.fillStyle = camera.status === 'active' ? '#10B981' : '#F59E0B';
      ctx.fillText(`RADAR STATS: ${camera.status.toUpperCase()}`, 16, 32);
      ctx.fillStyle = '#E0E3E5';
      ctx.fillText(`SPEED LIMIT: ${speedLimit} KM/H`, 16, 43);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.fillText(`VEHICLES REGISTERED: ${vehiclesRef.current.length}`, 16, 52);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [camera, speedLimit]);

  // ANPR License Plate Capture logger loop
  useEffect(() => {
    const captureInterval = setInterval(() => {
      if (vehiclesRef.current.length === 0) return;

      // Select a random vehicle
      const veh = vehiclesRef.current[Math.floor(Math.random() * vehiclesRef.current.length)];
      
      // Update vehicle plate and velocity occasionally to simulate new cars passing
      const isSpeeding = Math.random() > 0.82;
      const speedKmh = isSpeeding
        ? speedLimit + Math.floor(Math.random() * 22) + 6
        : Math.max(15, camera.avgSpeed + Math.floor(Math.random() * 8) - 4);
      
      veh.plate = generateIndianPlate();
      veh.speedKmh = speedKmh;
      veh.isSpeeding = isSpeeding;
      veh.type = (['Sedan', 'SUV', 'Truck', 'Bus'] as any)[Math.floor(Math.random() * 4)];

      const now = new Date();
      const timeString = now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const newRecord: ScannedRecord = {
        id: `scanned-${Date.now()}-${Math.random()}`,
        timestamp: timeString,
        plate: veh.plate,
        speedKmh,
        isSpeeding,
        type: veh.type
      };

      setScannedLogs((prev) => [newRecord, ...prev].slice(0, 20)); // Limit log size to 20
    }, 2800);

    return () => clearInterval(captureInterval);
  }, [camera, speedLimit]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* Simulation Screen */}
      <div ref={containerRef} className="relative md:col-span-2 aspect-video overflow-hidden border border-[#1A1A1A] select-none bg-[#101415]">
        {/* Unsplash Camera Image Backdrop */}
        <img
          src={camera.snapshotUrl}
          alt="CCTV snapshot"
          className="w-full h-full object-cover opacity-85 select-none pointer-events-none"
        />
        {/* HTML5 Canvas overlay for real-time dynamic boxes */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10 pointer-events-none w-full h-full"
        />
        {/* HUD Red Dot Overlay */}
        <div className="absolute top-3 right-3 z-20 bg-black/60 text-white px-2 py-0.5 text-[9px] font-mono font-bold flex items-center gap-1.5 rounded-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping" />
          <span className="text-[#EF4444] font-extrabold uppercase">ANPR LIVE FEED</span>
        </div>
      </div>

      {/* Scanned Plates Terminal Logger */}
      <div className="flex flex-col h-full min-h-[220px] md:min-h-0 border border-[#1A1A1A] bg-[#1A1A1A] text-white p-3 font-mono text-[10px] shadow-inner select-text">
        <div className="flex items-center gap-1.5 pb-2 border-b border-white/10 mb-2 font-bold text-gray-300">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>ANPR LICENSE LOG // LIMIT {speedLimit} KMH</span>
        </div>

        {/* Live plate capture feed list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-white/25 pr-1 max-h-[170px] md:max-h-[220px]">
          {scannedLogs.length === 0 ? (
            <div className="text-gray-500 italic flex items-center justify-center h-full text-center">
              Awaiting ANPR license scanning triggers...
            </div>
          ) : (
            scannedLogs.map((log) => (
              <div
                key={log.id}
                className={`p-1.5 border border-white/5 transition-colors flex flex-col gap-0.5 ${
                  log.isSpeeding
                    ? 'bg-red-950/40 border-red-900/30 text-red-300 animate-pulse'
                    : 'bg-black/20 border-white/5 text-emerald-400'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>🚗 {log.plate}</span>
                  <span>{log.timestamp}</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-gray-400">
                  <span>CLASS: {log.type.toUpperCase()}</span>
                  <span className={log.isSpeeding ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {log.isSpeeding ? 'SPEEDING: ' : ''}{log.speedKmh} KM/H
                  </span>
                </div>
                {log.isSpeeding && (
                  <div className="flex items-center gap-1 text-[8px] font-extrabold uppercase text-red-500 font-mono pt-0.5 border-t border-red-900/25 mt-0.5">
                    <ShieldAlert className="w-3 h-3 text-red-500 shrink-0" />
                    <span>ANPR SPEED LIMIT CITATION RECORDED</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default CameraFeedSimulator;
