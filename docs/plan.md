# FlowCast — Build Plan v2 (on the real repo)

> Supersedes the Next.js draft. We build **on `TanCodeX/FlowCast`** (Vite + React 19 + Express + Groq). Map switches from custom SVG to **react-leaflet**. Product logic already largely exists — this plan is the delta to a winning demo.

## What already exists (reuse, don't rebuild)

- **`server.ts`** — Express + Groq (`llama-3.3-70b-versatile`), routes `/api/health`, `/api/ai-forecast`, `/api/route-analyze`, **each with a deterministic fallback when `GROQ_API_KEY` is missing** → bug-free stage demo already handled.
- **`src/App.tsx`** — tab state; `handleTriggerIncident` injects incident → adds social signal → downgrades nodes (`node-cp/node-aiims/node-nh44`) → bumps route delay.
- **`src/types.ts`** — `TrafficNode`, `Incident` (`category` incl. `vip_movement`, `confidencePercent`, `cascadingRoads`), `SocialSignal` (`reliabilityScore`, `sentiment`), `RouteOption`, `CameraFeed`.
- **`src/data/delhiTrafficData.ts`** — `INITIAL_NODES/INCIDENTS/SOCIAL_SIGNALS`, `PRESET_ROUTES`, `CAMERA_FEEDS`.
- **`src/components/`** — `InteractiveMap` (SVG, being replaced), `Dashboard`, `DemoSimulationModal` (3 scenarios), `RoutePlanner`, `Header/Hero/FeatureGrid/AboutAI/Documentation/Footer`.
- Already has `forecastMinutesAhead` prop driving arterial color + heatmap opacity → horizon mechanic is half-built.

## Change 1 — Map: SVG → react-leaflet (the big swap)

`npm i react-leaflet leaflet` + `npm i -D @types/leaflet`. Vite/CSR → no SSR gotchas; import `leaflet/dist/leaflet.css` once (e.g. in `index.css` or `main.tsx`).

**Data:** add real `lat`/`lng` to `TrafficNode` + `Incident` (keep `coords{x,y}` or drop). Map existing ids to gazetteer coords:
`node-cp`→CP `28.6315,77.2167` · `node-aiims`→AIIMS `28.5672,77.2100` · `node-nh44`→NH44/Jahangirpuri `28.7256,77.1128` · India Gate `28.6129,77.2295` · ITO `28.6289,77.2410` · Minto Rd `28.6330,77.2200` · Chanakyapuri `28.5930,77.1860`.

**Rewrite `InteractiveMap.tsx`** to the same props (`nodes, incidents, selected*, forecastMinutesAhead`) but Leaflet-backed. Preserve the existing look/behaviour:
- `<MapContainer center={[28.61,77.22]} zoom={12}>` + CartoDB dark `<TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />`.
- `<CircleMarker>` per node, color by `status` (reuse `getNodeColor`), `<Popup>` = name + km/h.
- `<Circle radius={radiusAt(inc, forecastMinutesAhead)}>` per incident jam (meters), color by severity, opacity grows with horizon — replaces the SVG heatmap circles.
- `<Polyline dashArray="6" color="#10B981">` detour per incident that has a route (reuse the AI-detour idea) — toggle with the existing "AI Detours" button.
- Keep the 3 layer-toggle buttons (Heatmap/Incidents/Detours) as show/hide of the layer groups; keep the "DELHI VECTOR RADAR" watermark.

**`radiusAt(inc, T)`** — small helper: `base(severity) + (max−base)·T/30`, scaled by `confidencePercent`. One assert test in a `*.test.ts` run via `npx tsx`.

**Update `DemoSimulationModal` scenarios** — swap scenario `coords{x,y}` for `lat/lng`.

## Change 2 — Live horizon slider (the before/after moment)

Wire a `Now / +15 / +30` slider (native `<input type="range" min=0 max=30 step=15>`) in `Dashboard`, feeding `forecastMinutesAhead` into `InteractiveMap`. Already partly plumbed — jam `<Circle>` radius + opacity grow as you drag. This is the #1 win; make it obvious and central.

## Change 3 — Warning→Confirmed gate (the fake-news answer)

`Incident`/`SocialSignal` already carry `confidencePercent` / `reliabilityScore`. Add a derived `severity` display: **1 signal at a location = yellow "Unverified Warning"; ≥2 signals (or a node speed-drop) = red "Confirmed"**. Show the badge on the map popup + social feed. Turns their existing reliability field into the live misinformation answer.

## Change 4 — Fake-news inject

Add a scenario/button that injects a **lone** unverified signal at a fresh location → stays **yellow** (no corroboration). A second inject (or node drop) flips it **red**. Demonstrates Change 3 live.

## Out of scope (Phase 2)

Real X/GPS feeds · OSRM/Mapbox real routing · fine-tuned NER · graph propagation · PostGIS/Redis/Kafka · auth · mobile. (Groq already covers the "AI" story.)

## Build order

1. `npm i react-leaflet leaflet` + add `lat/lng` to types + `delhiTrafficData` + modal scenarios.
2. Rewrite `InteractiveMap.tsx` on Leaflet (same props), preserve toggles + dark look. → verify: `npm run dev`, map renders Delhi dark, nodes + incident circles + detour show.
3. Horizon slider in `Dashboard` → jam circles grow Now→+30.
4. Warning→Confirmed badge (map popup + feed).
5. Fake-news inject scenario.
6. `radiusAt` + one `npx tsx` assert. `npm run lint` (`tsc --noEmit`) clean.

## Verification

- `npm run dev` → localhost:3000: dark Leaflet Delhi map, real-coord nodes, incident jam circles, dashed detour, layer toggles work.
- Open demo modal → inject VIP/waterlogging/collision → node turns severe, jam circle appears, social signal logs.
- Drag horizon slider → circles grow + opacity rises.
- Inject fake signal → yellow Unverified; second signal → red Confirmed.
- `npm run lint` passes. (optional) `vercel deploy` for backup link.

## Notes

- Keep Groq as the AI layer (don't swap to AI Gateway) — `.env.local` `GROQ_API_KEY`; fallbacks make it demo-safe keyless.
- `ponytail:` `radiusAt` severity→meters + est-vehicle density are tuned constants; label estimates in UI.
