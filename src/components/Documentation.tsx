import React, { useState } from 'react';
import { Terminal, Code, Check, Copy, Database } from 'lucide-react';

export const Documentation: React.FC = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'forecast' | 'route'>('forecast');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const sampleForecastRequest = `{
  "timeHorizonMinutes": 30,
  "activeIncidents": [
    {
      "title": "Connaught Place Vehicle Collision",
      "delayMinutes": 28,
      "severity": "severe"
    }
  ],
  "currentNodes": [
    { "id": "node-cp", "name": "Connaught Place", "avgSpeedKmh": 14 }
  ]
}`;

  const sampleForecastResponse = `{
  "success": true,
  "summary": "Forecast based on historical rules & social telemetry: Heavy congestion spillover detected from Connaught Place to Barakhamba and AIIMS Flyover.",
  "criticalHotspots": ["Connaught Place Regal Circle", "NH44 Jahangirpuri", "AIIMS Junction"],
  "recommendedAction": "Dispatch pre-emptive detours via Pragati Tunnel & Lodi Road corridor immediately.",
  "confidenceScore": 94
}`;

  const sampleRouteRequest = `{
  "origin": "Connaught Place, New Delhi",
  "destination": "Gurgaon Cyber City, Haryana",
  "timeHorizonMins": 30
}`;

  const sampleRouteResponse = `{
  "success": true,
  "origin": "Connaught Place, New Delhi",
  "destination": "Gurgaon Cyber City, Haryana",
  "aiAnalysis": "Standard GPS route will experience +25m delay due to cascading blockage at AIIMS Junction. Take Lodi Estate detour.",
  "recommendedDetourName": "Via Barakhamba Road & Lodi Estate Corridor",
  "timeSavedMinutes": 18,
  "riskLevel": "High Risk on Standard Route"
}`;

  return (
    <div className="w-full max-w-[1200px] mx-auto py-8 px-4 flex flex-col gap-10 animate-fade-up">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/20 text-[#D93B2D] text-xs font-mono font-bold uppercase tracking-widest">
          <Terminal className="w-3.5 h-3.5 text-[#D93B2D]" />
          <span>DEVELOPER & API DOCUMENTATION</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-serif font-black text-[#F2F0EB] tracking-tight">
          FlowCast Developer Platform
        </h2>
        <p className="text-base font-serif text-[#F2F0EB]/75">
          Integrate real-time predictive traffic forecasts into municipal control centers, logistics fleets, and navigation apps.
        </p>
      </div>

      {/* Interactive API Explorer */}
      <div className="bg-white border border-[#1A1A1A]/15 p-6 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1A1A1A]/15 pb-4 gap-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-[#D93B2D]" />
            <h3 className="font-serif font-bold text-xl text-[#1A1A1A]">REST API Endpoints</h3>
          </div>

          <div className="flex items-center gap-2 bg-[#F2F0EB] p-1 border border-[#1A1A1A]/20">
            <button
              onClick={() => setActiveTab('forecast')}
              className={`px-3 py-1.5 font-mono text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'forecast' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
            >
              POST /api/ai-forecast
            </button>
            <button
              onClick={() => setActiveTab('route')}
              className={`px-3 py-1.5 font-mono text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'route' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
            >
              POST /api/route-analyze
            </button>
          </div>
        </div>

        {/* Code View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#1A1A1A]/70 uppercase">Sample Request Body</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    activeTab === 'forecast' ? sampleForecastRequest : sampleRouteRequest,
                    'req'
                  )
                }
                className="text-xs font-mono font-bold text-[#D93B2D] hover:underline flex items-center gap-1 cursor-pointer uppercase"
              >
                {copiedEndpoint === 'req' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEndpoint === 'req' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-[#16191A] border border-[#1A1A1A] p-4 text-xs font-mono text-emerald-400 overflow-x-auto h-[260px]">
              {activeTab === 'forecast' ? sampleForecastRequest : sampleRouteRequest}
            </pre>
          </div>

          {/* Response Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#1A1A1A]/70 uppercase">Expected Response (200 OK)</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    activeTab === 'forecast' ? sampleForecastResponse : sampleRouteResponse,
                    'res'
                  )
                }
                className="text-xs font-mono font-bold text-[#D93B2D] hover:underline flex items-center gap-1 cursor-pointer uppercase"
              >
                {copiedEndpoint === 'res' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEndpoint === 'res' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-[#16191A] border border-[#1A1A1A] p-4 text-xs font-mono text-[#F2F0EB] overflow-x-auto h-[260px]">
              {activeTab === 'forecast' ? sampleForecastResponse : sampleRouteResponse}
            </pre>
          </div>
        </div>
      </div>

      {/* Connected Data Sources Status */}
      <div className="bg-white border border-[#1A1A1A]/15 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/15 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-700" />
            <h3 className="font-serif font-bold text-xl text-[#1A1A1A]">Live Data Ingestion Pipeline Status</h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1.5 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
            <span>ALL FEEDS HEALTHY</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b-2 border-[#1A1A1A] text-[#1A1A1A] uppercase">
                <th className="pb-2 font-bold">Data Source Provider</th>
                <th className="pb-2 font-bold">Feed Protocol</th>
                <th className="pb-2 font-bold">Uptime</th>
                <th className="pb-2 font-bold">Latency</th>
                <th className="pb-2 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/15">
              <tr>
                <td className="py-3 font-serif font-bold text-[#1A1A1A] text-sm">Delhi Traffic Police Official Feed</td>
                <td className="py-3 text-[#1A1A1A]/70">REST API / Webhook</td>
                <td className="py-3 text-emerald-700 font-bold">99.9%</td>
                <td className="py-3 text-[#1A1A1A]">1.2s</td>
                <td className="py-3 text-right">
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-700/30 px-2.5 py-0.5 font-bold text-[10px]">
                    ONLINE
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-serif font-bold text-[#1A1A1A] text-sm">IMD Rain Cell Radar (Delhi/NCR)</td>
                <td className="py-3 text-[#1A1A1A]/70">NetCDF / GeoJSON Stream</td>
                <td className="py-3 text-emerald-700 font-bold">99.8%</td>
                <td className="py-3 text-[#1A1A1A]">3.4s</td>
                <td className="py-3 text-right">
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-700/30 px-2.5 py-0.5 font-bold text-[10px]">
                    ONLINE
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-serif font-bold text-[#1A1A1A] text-sm">Delhi Metro Rail Operations (DMRC)</td>
                <td className="py-3 text-[#1A1A1A]/70">GTFS-RT Protocol</td>
                <td className="py-3 text-emerald-700 font-bold">100.0%</td>
                <td className="py-3 text-[#1A1A1A]">0.8s</td>
                <td className="py-3 text-right">
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-700/30 px-2.5 py-0.5 font-bold text-[10px]">
                    ONLINE
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-serif font-bold text-[#1A1A1A] text-sm">National Highway Toll Sensors (FASTag)</td>
                <td className="py-3 text-[#1A1A1A]/70">MQTT Stream</td>
                <td className="py-3 text-emerald-700 font-bold">99.5%</td>
                <td className="py-3 text-[#1A1A1A]">1.5s</td>
                <td className="py-3 text-right">
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-700/30 px-2.5 py-0.5 font-bold text-[10px]">
                    ONLINE
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
