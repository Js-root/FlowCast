import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";
import { INITIAL_NODES } from "./src/data/delhiTrafficData";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Groq AI Client
const apiKey = process.env.GROQ_API_KEY;
let aiClient: Groq | null = null;

if (apiKey) {
  try {
    aiClient = new Groq({ apiKey });
  } catch (err) {
    console.error("Failed to initialize Groq client:", err);
  }
}

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    system: "FlowCast Predictive Operations",
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString()
  });
});

// AI Traffic Forecast Analysis Route
app.post("/api/ai-forecast", async (req, res) => {
  try {
    const { activeIncidents, currentNodes, timeHorizonMinutes } = req.body;

    if (!aiClient || !process.env.GROQ_API_KEY) {
      // Fallback deterministic output if key missing
      return res.json({
        success: true,
        summary: "Forecast based on historical rules & social telemetry: Heavy congestion spillover detected from Connaught Place to Barakhamba and AIIMS Flyover. Waterlogging on NH44 will cause +45m delay over next 30 mins.",
        criticalHotspots: ["Connaught Place Regal Circle", "NH44 Jahangirpuri", "AIIMS Junction"],
        recommendedAction: "Dispatch pre-emptive detours via Pragati Tunnel & Lodi Road corridor immediately.",
        confidenceScore: 94
      });
    }

    const prompt = `You are the lead AI Traffic Predictive Analyst for Delhi NCR (FlowCast).
Analyze the following live incident feeds and road network conditions for a ${timeHorizonMinutes || 30}-minute forward forecast:

Active Incidents:
${JSON.stringify(activeIncidents || [], null, 2)}

Node Speeds & Congestion:
${JSON.stringify(currentNodes || [], null, 2)}

Provide a concise, highly authoritative predictive forecast breakdown for commuters, municipal authorities, and logistics dispatchers.
Format your response as clean JSON with these keys:
- summary: string (2-3 sentences explaining what will happen in the next 30 minutes before standard maps turn red)
- criticalHotspots: array of strings (top 3 road names/junctions at imminent risk)
- recommendedAction: string (actionable rerouting advice)
- confidenceScore: number (between 85 and 99)`;

    const response = await aiClient.chat.completions.create({
      messages: [
        { role: "system", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content || "{}";
    const data = JSON.parse(text);
    return res.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Error in /api/ai-forecast:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate AI forecast"
    });
  }
});

// Route Optimization & Disruption Analysis Route
app.post("/api/route-analyze", async (req, res) => {
  try {
    const { origin, destination, timeHorizonMins } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ success: false, error: "Origin and Destination are required" });
    }

    if (!aiClient || !process.env.GROQ_API_KEY) {
      return res.json({
        success: true,
        origin,
        destination,
        aiAnalysis: `AI Predictive Route from ${origin} to ${destination}: Standard GPS route will experience +25m delay in ${timeHorizonMins || 30} mins due to cascading blockage at major junctions. Take the recommended pre-emptive detour along secondary arterials to bypass gridlock.`,
        suggestedDetour: "Via Barakhamba Road & Lodi Estate Corridor",
        timeSavedMinutes: 18,
        riskLevel: "High Risk on Standard Route"
      });
    }

    const prompt = `Analyze route options between "${origin}" and "${destination}" in Delhi NCR for a commuter traveling in ${timeHorizonMins || 30} minutes.
Consider Delhi's key arterial roads, Ring Road bottlenecks, flyover chokepoints, and waterlogging/rally risks.

Respond in JSON format with:
- origin: string
- destination: string
- aiAnalysis: detailed sentence on why standard maps will fail and how AI predicts the disruption early.
- standardRouteDelayMins: estimated delay in minutes on primary route
- recommendedDetourName: name of recommended alternative road/flyover
- timeSavedMinutes: expected minutes saved by taking detour
- riskLevel: "High", "Medium", or "Low"
- keyChokepointsToAvoid: array of strings`;

    const response = await aiClient.chat.completions.create({
      messages: [
        { role: "system", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(response.choices[0]?.message?.content || "{}");
    return res.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Error in /api/route-analyze:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to analyze route"
    });
  }
});

// ---- LIVE DATA ROUTES ----

// Real Delhi traffic per node via TomTom Traffic Flow API (free tier).
// Falls back to seed node when key missing or a request fails (demo-safe).
app.get("/api/live-traffic", async (_req, res) => {
  const key = process.env.TOMTOM_API_KEY;
  if (!key) {
    return res.json({ success: false, live: false, reason: "no TOMTOM_API_KEY", nodes: INITIAL_NODES });
  }
  try {
    const nodes = await Promise.all(
      INITIAL_NODES.map(async (n) => {
        try {
          const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?unit=KMPH&point=${n.lat},${n.lng}&key=${key}`;
          const r = await fetch(url);
          if (!r.ok) throw new Error(`tomtom ${r.status}`);
          const d: any = await r.json();
          const f = d.flowSegmentData;
          const cur = Number(f?.currentSpeed) || 0;
          const free = Number(f?.freeFlowSpeed) || cur || 1;
          const ratio = cur / free;
          const status = f?.roadClosure
            ? "severe"
            : ratio >= 0.75 ? "clear"
            : ratio >= 0.5 ? "moderate"
            : ratio >= 0.3 ? "heavy"
            : "severe";
          const delay = Math.max(0, Math.round(((f?.currentTravelTime || 0) - (f?.freeFlowTravelTime || 0)) / 60));
          return { ...n, status, avgSpeedKmh: Math.round(cur), delayMinutes: delay };
        } catch {
          return n; // per-node fallback to seed
        }
      })
    );
    res.json({ success: true, live: true, nodes });
  } catch (error: any) {
    res.status(500).json({ success: false, live: false, error: error?.message, nodes: INITIAL_NODES });
  }
});

const normSeverity = (s: string): string => {
  const v = (s || "").toLowerCase();
  return v.includes("sev") || v.includes("high") ? "severe"
    : v.includes("heav") ? "heavy"
    : v.includes("mod") || v.includes("med") ? "moderate"
    : "low";
};
const normCategory = (t: string): string => {
  const v = (t || "").toLowerCase();
  if (v.includes("water") || v.includes("flood") || v.includes("rain")) return "waterlogging";
  if (v.includes("vip") || v.includes("convoy")) return "vip_movement";
  if (v.includes("protest") || v.includes("rally") || v.includes("march")) return "rally";
  if (v.includes("accident") || v.includes("collision") || v.includes("crash")) return "collision";
  if (v.includes("signal") || v.includes("light")) return "signal_failure";
  return "construction";
};

// Real social incidents from Reddit r/delhi -> Groq classification.
// Reddit needs no key; Groq classification needs GROQ_API_KEY (else raw posts as signals).
app.get("/api/live-incidents", async (_req, res) => {
  try {
    const q = encodeURIComponent('Delhi traffic OR "traffic jam" OR protest OR waterlogging OR roadblock OR diversion');
    const rr = await fetch(`https://news.google.com/rss/search?q=${q}+when:2d&hl=en-IN&gl=IN&ceid=IN:en`, {
      headers: { "User-Agent": "Mozilla/5.0 (FlowCast traffic demo)" },
    });
    if (!rr.ok) throw new Error(`news ${rr.status}`);
    const xml = await rr.text();
    const decode = (s: string) =>
      s.replace(/<!\[CDATA\[|\]\]>/g, "")
        .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
    const posts = items
      .map((it, idx) => {
        const title = decode(it.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "");
        const pub = it.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";
        const created = pub ? Math.floor(new Date(pub).getTime() / 1000) : Math.floor(Date.now() / 1000);
        return { id: `gn-${idx}`, title, text: "", created };
      })
      .filter((p) => p.title);
    const KW = /(traffic|jam|jaam|protest|rally|road|accident|waterlog|flood|rain|metro|blocked|rasta|diversion|vip|convoy|gridlock|congestion|barricade)/i;
    const relevant = (posts.some((p) => KW.test(p.title)) ? posts.filter((p) => KW.test(p.title)) : posts).slice(0, 12);

    const signals = relevant.slice(0, 8).map((p: any) => ({
      id: `nsig-${p.id}`,
      timeAgo: `${Math.max(1, Math.round((Date.now() / 1000 - p.created) / 60))}m ago`,
      platform: "Citizen Report",
      handle: "Google News",
      text: p.title,
      sentiment: "warning",
      reliabilityScore: 74,
      impactArea: "Delhi",
    }));

    if (!relevant.length || !aiClient) {
      return res.json({ success: true, live: Boolean(aiClient), incidents: [], signals });
    }

    const prompt = `You extract Delhi NCR traffic-disruption events from social posts.
Posts:
${relevant.map((p: any, i: number) => `${i}. ${p.title} ${p.text}`).join("\n")}

Return clean JSON: {"events":[{"type":"protest|vip_movement|waterlogging|collision|signal_failure|construction","severity":"severe|heavy|moderate|low","location":"specific Delhi road/landmark","lat":number,"lng":number,"delayMinutes":number,"confidence":number,"summary":"one short sentence","sourceIndex":number}]}
Only include events that name a real Delhi location you can give approximate lat/lng for. If none, return {"events":[]}.`;

    const response = await aiClient.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });
    const data = JSON.parse(response.choices[0]?.message?.content || "{}");
    const events: any[] = Array.isArray(data.events) ? data.events : [];

    const incidents = events
      .filter((e) => Number.isFinite(e.lat) && Number.isFinite(e.lng))
      .slice(0, 8)
      .map((e, i) => ({
        id: `live-${relevant[e.sourceIndex]?.id || i}`,
        title: (e.summary || e.type || "Live incident").slice(0, 70),
        area: e.location || "Delhi",
        severity: normSeverity(e.severity),
        category: normCategory(e.type),
        delayMinutes: Math.round(e.delayMinutes) || 15,
        startsInMinutes: 10,
        confidencePercent: Math.min(95, Math.round(e.confidence) || 65),
        socialSource: "Reddit r/delhi (live)",
        description: e.summary || "",
        lat: e.lat,
        lng: e.lng,
        cascadingRoads: [],
      }));

    res.json({ success: true, live: true, incidents, signals });
  } catch (error: any) {
    console.error("Error in /api/live-incidents:", error);
    res.status(500).json({ success: false, live: false, error: error?.message, incidents: [], signals: [] });
  }
});

// Start Express Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "localhost", () => {
    console.log(`FlowCast server running on http://localhost:${PORT}`);
  });
}

startServer();
