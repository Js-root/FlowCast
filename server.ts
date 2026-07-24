import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";

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

// Live Data Telemetry Route (TomTom Integration)
app.post("/api/live-data", async (req, res) => {
  try {
    const { nodes } = req.body;
    if (!nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ success: false, error: "Nodes array is required" });
    }

    const tomtomKey = process.env.TOMTOM_API_KEY;
    let updatedNodes = [...nodes];

    let liveIncidents: any[] | null = null;
    if (tomtomKey && tomtomKey !== "YOUR_TOMTOM_API_KEY") {
      // 1. Fetch real data from TomTom API
      const fetchPromises = updatedNodes.map(async (node) => {
        try {
          const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${tomtomKey}&point=${node.lat},${node.lng}`;
          const response = await fetch(url);
          const data = await response.json();
          if (data && data.flowSegmentData) {
            const flow = data.flowSegmentData;
            // Update node with real TomTom speeds
            node.avgSpeedKmh = flow.currentSpeed || node.avgSpeedKmh;
            
            // Calculate delay based on freeFlowSpeed
            const delay = Math.max(0, (flow.freeFlowTravelTime || 0) - (flow.currentTravelTime || 0));
            node.delayMinutes = Math.round(delay / 60);

            // Re-calculate status
            const speedRatio = node.avgSpeedKmh / (flow.freeFlowSpeed || 40);
            if (speedRatio > 0.7) node.status = 'clear';
            else if (speedRatio > 0.4) node.status = 'moderate';
            else if (speedRatio > 0.2) node.status = 'heavy';
            else node.status = 'severe';
          }
        } catch (err) {
          console.error(`Failed to fetch TomTom data for node ${node.id}:`, err);
        }
        return node;
      });

      updatedNodes = await Promise.all(fetchPromises);

      // Fetch Live Incidents
      try {
        const bbox = "77.0,28.4,77.4,28.9"; // Delhi bounds
        const incidentUrl = `https://api.tomtom.com/traffic/services/5/incidentDetails/json?key=${tomtomKey}&bbox=${bbox}&fields={incidents{geometry{coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description},from,to,length,delay}}}`;
        const incRes = await fetch(incidentUrl);
        const incData = await incRes.json();
        
        if (incData && incData.incidents) {
          liveIncidents = incData.incidents.map((inc: any) => {
            const props = inc.properties || {};
            let lat = 28.6139;
            let lng = 77.2090;
            if (inc.geometry && inc.geometry.coordinates && inc.geometry.coordinates.length > 0) {
                const firstCoord = inc.geometry.coordinates[0];
                if (Array.isArray(firstCoord)) {
                    lng = firstCoord[0];
                    lat = firstCoord[1];
                } else {
                    lng = inc.geometry.coordinates[0];
                    lat = inc.geometry.coordinates[1];
                }
            }

            let severity = 'moderate';
            if (props.magnitudeOfDelay === 3 || props.magnitudeOfDelay === 4) severity = 'severe';
            else if (props.magnitudeOfDelay === 1 || props.magnitudeOfDelay === 0) severity = 'low';
            
            let category = 'signal_failure';
            if (props.iconCategory === 6) category = 'collision';
            else if (props.iconCategory === 8 || props.iconCategory === 9) category = 'construction';

            return {
              id: props.id || Math.random().toString(),
              title: props.events?.[0]?.description || 'Live Traffic Incident',
              area: props.from ? `${props.from}${props.to ? ` to ${props.to}` : ''}` : 'Delhi NCR Area',
              severity,
              category,
              delayMinutes: Math.round((props.delay || 0) / 60),
              startsInMinutes: 0,
              confidencePercent: 99,
              socialSource: 'TomTom Live',
              description: props.events?.[0]?.description ? `TomTom reports: ${props.events[0].description}. Impact length: ${props.length || 0}m.` : 'Live incident detected by TomTom sensor network.',
              lat,
              lng,
              cascadingRoads: props.to ? [props.to] : []
            };
          }).filter((i: any) => i.severity !== 'low').slice(0, 15);
        }
      } catch (err) {
        console.error("Failed to fetch TomTom incidents:", err);
      }
    } else {
      // 2. Fallback Jitter Simulation if key is missing
      updatedNodes = updatedNodes.map((node) => {
        // Randomly fluctuate speed by -3 to +3 km/h
        const speedJitter = Math.floor(Math.random() * 7) - 3;
        let newSpeed = Math.max(5, node.avgSpeedKmh + speedJitter);
        
        // Slightly fluctuate delay
        const delayJitter = Math.floor(Math.random() * 5) - 2;
        let newDelay = Math.max(0, node.delayMinutes + delayJitter);

        let newStatus = node.status;
        if (newSpeed < 15) newStatus = 'severe';
        else if (newSpeed < 25) newStatus = 'heavy';
        else if (newSpeed < 35) newStatus = 'moderate';
        else newStatus = 'clear';

        return { ...node, avgSpeedKmh: newSpeed, delayMinutes: newDelay, status: newStatus };
      });
    }

    return res.json({ success: true, nodes: updatedNodes, incidents: liveIncidents });
  } catch (error: any) {
    console.error("Error in /api/live-data:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to fetch live data"
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

    const tomtomKey = process.env.TOMTOM_API_KEY;
    let realTimeData = "";

    if (tomtomKey && tomtomKey !== "YOUR_TOMTOM_API_KEY") {
      try {
        // Geocode origin
        const originGeoUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(origin)}.json?key=${tomtomKey}&limit=1`;
        const originRes = await fetch(originGeoUrl);
        const originData = await originRes.json();
        
        // Geocode destination
        const destGeoUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(destination)}.json?key=${tomtomKey}&limit=1`;
        const destRes = await fetch(destGeoUrl);
        const destData = await destRes.json();

        if (originData.results?.[0]?.position && destData.results?.[0]?.position) {
          const oPos = originData.results[0].position;
          const dPos = destData.results[0].position;
          
          // Calculate Route
          const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${oPos.lat},${oPos.lon}:${dPos.lat},${dPos.lon}/json?key=${tomtomKey}&traffic=true&computeTravelTimeFor=all`;
          const routeRes = await fetch(routeUrl);
          const routeData = await routeRes.json();

          if (routeData.routes && routeData.routes[0]) {
            const summary = routeData.routes[0].summary;
            const standardDuration = summary.noTrafficTravelTimeInSeconds / 60;
            const trafficDuration = summary.travelTimeInSeconds / 60;
            const delay = summary.trafficDelayInSeconds / 60;
            
            realTimeData = `\nREAL-TIME TOMTOM TELEMETRY:
- Standard Travel Time: ${Math.round(standardDuration)} mins
- Current Travel Time in Traffic: ${Math.round(trafficDuration)} mins
- Current Delay: ${Math.round(delay)} mins
Based on this real-world standard delay, your job is to predict how much WORSE the delay will get in the next ${timeHorizonMins || 30} minutes due to cascading bottlenecks, and recommend a detour.`;
          }
        }
      } catch (err) {
        console.error("Failed to fetch TomTom Directions:", err);
      }
    }

    const prompt = `Analyze route options between "${origin}" and "${destination}" in Delhi NCR for a commuter traveling in ${timeHorizonMins || 30} minutes.
Consider Delhi's key arterial roads, Ring Road bottlenecks, flyover chokepoints, and waterlogging/rally risks.
${realTimeData}

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
