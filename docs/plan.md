# FlowCast — Build Plan (audited, Phase 1)

> Build spec for [`project.md`](./project.md). Audited: design gaps resolved, over-engineering cut. **Foundation doc — not yet built.**

## What we're building (scope honesty)

A **hackathon demo**, not a production traffic system. It must prove one story on stage:

> "Google Maps shows CP green right now. FlowCast already flags a 30-min gridlock — because a protest post dropped 2 minutes ago."

Everything in scope serves that 60-second story. Everything else is Phase 2.

## Decisions (locked)

- **LLM classify via AI Gateway**, keyword classifier as fallback. Default = keyword (no key) → deterministic demo.
- **Fuller map** — CP protest + ITO cave-in + India Gate VIP.
- **Naive reroute line** — offset waypoint around jam circle.
- Manual click-reveal on stage · local screen-share demo, Vercel link as backup.

## Scope decisions (keep / cut)

| Component | Proposed (source) | **Our call** | Why |
|---|---|---|---|
| Streaming | Kafka / Celery | **Poll, in-process** | No broker survives a 48h build. |
| Event NLP | spaCy + XLM-RoBERTa microservice | **Keyword classify, LLM optional** | One function; keyword runs free + deterministic. |
| Geocoding | Nominatim | **Gazetteer only** (Nominatim → Phase 2) | Every demo post hits the gazetteer; no network failure mode on stage. |
| Propagation | NetworkX cellular automata | **Growing radius formula** | Nobody verifies a graph sim in a demo. |
| GPS | Live TomTom/HERE flow | **Mock anomalies** | No public live Delhi GPS feed. |
| DB / Cache | PostGIS + Redis | **In-memory / JSON** | Demo state fits in a variable. |
| Frontend | Streamlit / Mapbox | **Next.js + Leaflet + OSM** | Deployable Vercel link, no map token. |
| Social source | Apify / Nitter / X API | **Mock feed, real seam** | X API = paid + approval. Same shape, swap later. |
| Output format | GeoJSON | **Plain JSON `{events,posts,stats}`** | Circles aren't GeoJSON geometry; radius is a prop. |

### Kept good parts
- **Deterministic demo** — mock feed + inject buttons; no `SIMULATION_MODE` flag needed (whole app is simulation).
- **Cross-validation** — 1 signal = Warning (yellow), 2 = Confirmed (red). The "fake tweet?" answer.
- **Hinglish keywords** — `jaam`, `rasta band`, `pradarshan`, `andolan`, `kaphila`, `gaddha`.
- **Now/+15/+30 slider** — the before/after is the pitch.

## Architecture

```
data/mock_posts.json ──┐
                       ├─► /api/predict ──► {events, posts, stats} ──► Leaflet map + Now/+15/+30 slider
mock gpsAnomalies    ──┘   (classify → geocode → cross-validate → jam radius → reroute)
```

Single Next.js app. One API route. No services, no DB, no broker.

### /api/predict pipeline
1. **Read** posts + gpsAnomalies + `injected` ids (mock file now; real feed later, same shape).
2. **Classify** each post → `{ type, confidence, terms }`. LLM via AI Gateway if `AI_GATEWAY_API_KEY` set (≤2s timeout, try/catch); **any failure or no key → keyword classifier**. Types: `protest | vip | cave-in | accident`.
3. **Geocode** text → gazetteer **key** (`cp` | `ito` | `indiagate` | …) via name/alias substring match.
4. **Cross-validate** — group posts by key; `confirmed` if ≥2 posts at that key OR a GPS anomaly within ~500 m; else `warning`.
5. **Jam model** — `radiusNowM` + `radiusMaxM` (at +30) per event; `radiusAt(T) = radiusNow + (radiusMax − radiusNow)·T/30`, scaled by type severity × confidence.
6. **Reroute** — drawn **only for events with a `ROUTES[key]` entry** (`cp`, `ito`, `indiagate`); other spots (e.g. Karol Bagh fake-news) show the circle only. `ROUTES[key] = {from, to}`; detour polyline `[from, waypoint, to]`, waypoint = route midpoint pushed perpendicular off the event center by `radiusAt(T) + margin`. Illustrative, not routed.
7. **Return** plain JSON: `{ events, posts, stats }`.

## Data model

```jsonc
// input post (mock now, real feed later)
{ "id": "p1", "handle": "@x", "ts": "ISO8601", "text": "..." }

// gps anomaly (mock)
{ "id": "g1", "lat": 28.63, "lng": 77.21, "speedKph": 4 }

// derived event (API output)
{
  "id": "cp",                     // gazetteer key = group key
  "type": "protest",
  "location": "Connaught Place",
  "lat": 28.6315, "lng": 77.2167,
  "severity": "confirmed",        // warning | confirmed
  "confidence": 0.8,
  "signals": ["p1", "p2", "g1"],
  "radiusNowM": 300,
  "radiusMaxM": 900,              // at +30 min
  "route": { "from": [28.60,77.20], "to": [28.66,77.23] }
}
```

## Keyword rules

| Type | Triggers (EN + Hinglish) |
|---|---|
| protest | protest, dharna, pradarshan, andolan, rasta band, kisaan, road block |
| vip | vip, convoy, cavalcade, kaphila, president, pm, minister |
| cave-in | caved, cave-in, road caved, gaddha, sinkhole, dhasan |
| accident | accident, crash, hadsa, takkar |

Confidence = base(type) bumped per extra matching term. Cap 0.95 (never claim certainty).

### Gazetteer (keyed Delhi landmarks)
`cp` Connaught Place/Rajiv Chowk `28.6315,77.2167` · `ito` `28.6289,77.2410` · `dhaulakuan` `28.5915,77.1610` · `indiagate` `28.6129,77.2295` · `aiims` `28.5672,77.2100` · `kashmeregate` `28.6675,77.2281` · `chandnichowk` `28.6506,77.2303` · `nehruplace` `28.5494,77.2517` · `karolbagh` `28.6512,77.1907` · `saket` `28.5245,77.2066`
`ROUTES` (demo from/to) defined for the 3 demo keys: `cp`, `ito`, `indiagate`.

## Files (Phase 1)

Fresh scaffold: `create-next-app` rejects the dir name (space+caps) → scaffold into temp `flowcast-scaffold` (`--ts --app --no-src-dir --no-eslint --tailwind --yes`), move files up, delete temp. Then `npm i leaflet @types/leaflet` (Leaflet direct, no react-leaflet). Add `ai` only when wiring optional LLM.

- **`data/mock_posts.json`** — `posts[]` + `gpsAnomalies[]`. Seed: CP protest (2 posts + 1 GPS drop → Confirmed), ITO cave-in (1 → Warning), India Gate VIP (1 → Warning). Hinglish text hitting gazetteer terms.
- **`lib/predict.ts`** — whole engine, one file: `GAZETTEER`, `ROUTES`, `KEYWORDS`; `classify(text)`; `geocode(text)→key`; `buildEvents(posts, gps, injectedIds)→Event[]`; `radiusAt(event, T)`; `rerouteWaypoint(event, T)`; `estStats(events, T)`.
  - `// ponytail: made-up vehicle-density constant in estStats, tune if a real figure lands; UI labels it "est".`
- **`lib/predict.test.ts`** — one assert check (run via `npx tsx`, not `node` — it imports TS): Hinglish protest → `protest`; 2 CP posts → `confirmed`, 1 → `warning`; `radiusAt(+30) > radiusAt(0)`; reroute waypoint ≠ midpoint.
- **`app/api/predict/route.ts`** — reads mock + `injected`, returns `{events, posts, stats}`.
- **`app/page.tsx`** (client) — map + feed sidebar + control bar (inject buttons, horizon slider, legend, stats chip, toast). State: `T`, `injectedIds`; fetch `/api/predict`.
- **`app/Map.tsx`** — `dynamic(() => import('./MapInner'), { ssr: false })`. Inner: Leaflet `CircleMarker` per event (avoids broken default-icon bug), `L.circle(center, radiusAt(T))` colored by severity + opacity by confidence, polylines (original through jam + dashed-green detour), popups. Dark tiles = CartoDB `dark_all` (free, no token). Import `leaflet/dist/leaflet.css`.

## Build order — Phase 1

MUST (build first, in order):
- [ ] `data/mock_posts.json`
- [ ] `lib/predict.ts` (+ `lib/predict.test.ts`, run via `npx tsx`)
- [ ] `app/api/predict/route.ts`
- [ ] `app/Map.tsx` (dynamic, ssr:false)
- [ ] `app/page.tsx` — map + slider + inject buttons + legend
- [ ] Live feed sidebar · alert toast · event popup · fake-news path · impact-stats chip

STRETCH (after core works end-to-end):
- [ ] Voice alert (`speechSynthesis`) — gated behind inject click (user gesture)
- [ ] Browser push (Notification API) — gated behind permission
- [ ] Confidence-scaled opacity polish

## Tech stack (two modes — pitch honestly)

| Layer | 48h Build (what runs) | Production Roadmap |
|---|---|---|
| Frontend / Map | Next.js + Leaflet + OSM tiles | Next.js + Mapbox GL |
| Backend | Next.js API route (serverless) | FastAPI + WebSockets |
| Event NLP | Keyword rules + optional LLM (AI Gateway) | Fine-tuned XLM-R / IndicBERT |
| Geocoding | Landmark gazetteer | Mapbox geocoding + Nominatim + gazetteer |
| Propagation | Radius-growth model | NetworkX graph propagation |
| GPS / Traffic | Mock anomalies | TomTom / HERE flow API |
| Social source | Mock feed (`{id,text,handle,ts}` seam) | Apify / Nitter → X filtered stream |
| Streaming | In-process poll | Kafka / Redpanda |
| Store | JSON / in-memory | PostGIS + Redis |
| Deploy | Vercel | Cloud + Docker |

> Pitch line: *"$0 hackathon build on free tiers; production API fees are covered by the B2B fleet subscription model."*

## Demo script (~60s) — matches the build

1. **Delhi, calm.** "Maps says CP is clear right now."
2. **Post drops.** *"pradarshan near CP, rasta band"* → **yellow Warning** at Connaught Place.
3. **Second signal.** 2nd post + GPS speed-drop → **red, Confirmed**. (The fake-news answer, live.)
4. **The part Maps can't do.** Slide **Now → +30 min** → jam radius grows over surrounding roads.
5. **Reroute.** Dashed-green detour bends around the jam.
6. **Close.** "15 minutes before the jam forms, fleets already have the warning."

*(Map also carries ITO cave-in + India Gate VIP for city-wide context.)*

## LLM wiring note

Default off (no key) so the demo is deterministic. When enabling: load the `vercel:ai-sdk` skill first (AI SDK v6, gateway `"provider/model"` string), keep the ≤2s timeout + keyword fallback.

## Verification

1. `npx tsx lib/predict.test.ts` — asserts pass.
2. `npm run dev` → `localhost:3000`: dark Delhi map, 3 seeded events (CP red, ITO/India Gate yellow), feed sidebar populated.
3. **Inject Protest** → yellow at CP-area; second signal → red. **Inject fake protest** (Karol Bagh) → stays yellow.
4. Drag slider Now→+30 → jam circles grow; dashed-green reroute bends around each; popup shows confidence + est delay; stats chip updates.
5. (optional) `vercel deploy` — shareable backup link.

## Out of scope (frame as roadmap, not gaps)

Live X/GPS feeds · Nominatim geocoding · graph jam propagation · real route re-planning · auth · DB · mobile app · fleet widget SDK.

---

# Execution Phases (fresh-context executable)

Each phase is self-contained: refs the Allowed-APIs below, states what to build, how to verify, and what NOT to do. Run in order; each ends verifiable.

## Phase 0 — Allowed APIs (pin these; do not invent)

**Leaflet** (client-only; `import L from 'leaflet'` + `import 'leaflet/dist/leaflet.css'`). Ref: leafletjs.com/reference.
- `L.map(container, { center:[lat,lng], zoom })`; cleanup `map.remove()` in `useEffect` return.
- Dark tiles: `L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution:'© OpenStreetMap, © CARTO' })`.
- **`L.circle([lat,lng], { radius })` — radius in METERS** (jam zone). **`L.circleMarker([lat,lng], { radius })` — radius in PIXELS** (event dot). Do not swap.
- `L.polyline([[lat,lng],…], { color, dashArray })`; `.bindPopup(htmlString)`; `.addTo(map)`; `layer.remove()`.
- **Anti-pattern:** `L.marker` default icon breaks under bundlers → use `circleMarker`/`divIcon`. Never `import 'leaflet'` in a Server Component.

**Next.js App Router** (Next 15/16). Ref: nextjs.org/docs/app.
- Client comp: `'use client'`. No-SSR map: `const Map = dynamic(() => import('./MapInner'), { ssr:false })`.
- Route handler: `export async function GET(req: Request) { return Response.json(payload) }`.
- Read mock data: `import mock from '@/data/mock_posts.json'` (no `fs`). Params: `new URL(req.url).searchParams.getAll('injected')`.
- **Anti-pattern:** no `getServerSideProps`/pages-router APIs; no `fs` for the bundled JSON.

**Test:** `npx tsx lib/predict.test.ts` (node can't import TS). Plain `assert` from `node:assert`.

**AI SDK (optional, deferred):** do NOT hardcode. When wiring, load `vercel:ai-sdk` skill first (v6, gateway `"provider/model"` string), keep ≤2s timeout + keyword fallback.

## Phase 1 — Engine (pure logic, no UI)

Build: scaffold Next.js (temp-dir trick) → `npm i leaflet @types/leaflet` → `data/mock_posts.json` → `lib/predict.ts` (`GAZETTEER`, `ROUTES`, `KEYWORDS`, `classify`, `geocode`, `buildEvents`, `radiusAt`, `rerouteWaypoint`, `estStats`) → `lib/predict.test.ts`.
Verify: `npx tsx lib/predict.test.ts` — all asserts pass (protest classify · 2-post confirmed / 1-post warning · radius grows · waypoint ≠ midpoint).
Anti-pattern guard: keep classify pure + synchronous for keyword path (LLM path async, behind key + timeout).

## Phase 2 — API route

Build: `app/api/predict/route.ts` — read mock + `injected` ids, run `buildEvents`, return `{events, posts, stats}`.
Verify: `npm run dev`; `curl 'localhost:3000/api/predict'` → 3 events (cp confirmed, ito/indiagate warning); `curl '…?injected=karolbagh-fake'` → adds a warning event.

## Phase 3 — Map + core UI

Build: `app/Map.tsx` (dynamic ssr:false wrapper) + `MapInner` — CircleMarker per event, `L.circle` jam (meters) colored by severity, reroute polylines where `ROUTES[key]` exists. `app/page.tsx` — map + horizon slider (0/15/30) + inject buttons + legend. Set `app/layout.tsx` `<title>FlowCast</title>`.
Verify: dev server — dark Delhi map, 3 events, slider grows circles, dashed-green reroute on cp/ito/indiagate, inject buttons add events.

## Phase 4 — Rich MUST adds

Build: live post-feed sidebar · alert toast ("congestion expected in N min") · event popup (type · conf% · signals · est delay) · fake-news path (inject `karolbagh-fake` → stays yellow until 2nd signal) · impact-stats chip (labeled "est").
Verify: inject fake → yellow, no reroute; second signal → red; stats chip updates with slider.

## Phase 5 — Verification + STRETCH

Build (optional): voice alert (`speechSynthesis`, gated on inject click) · browser push (Notification API, gated on permission) · opacity polish.
Verify: `npm run build` clean; grep guard for invented APIs (`grep -rn "L.marker(" app/` should be empty; no `getServerSideProps`); run the 5-step demo script end-to-end; (optional) `vercel deploy`.
