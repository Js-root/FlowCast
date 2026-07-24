# FlowCast — Predict traffic before it happens

> AI-Powered Micro-Event Traffic Disruption Predictor. The **Pre-Traffic Intelligence Layer** for smart cities.
> Fuses real-time social-media event signals with GPS anomalies to forecast Delhi jams **15–30 min before** congestion forms.

**Companion doc:** [`plan.md`](./plan.md) — the audited build spec (how). This doc = the project (what + why + pitch).
**Name:** FlowCast *(flow + forecast).*

---

## Executive Summary

**Problem.** Delhi's roads gridlock within minutes from protests, VIP convoys, processions, road cave-ins, floods, and accidents. Navigation apps rely on vehicle-speed data — they see congestion only *after* it forms.

**Solution.** FlowCast fuses real-time social-media signals, official updates, and GPS anomalies to forecast disruptions **15–30 minutes before** congestion forms, so commuters and fleets reroute proactively.

**Vision.** Become the AI prediction layer under every navigation platform, logistics fleet, and smart-city traffic system.

## Elevator Pitch (30s)

Imagine knowing about a traffic jam before it exists. FlowCast listens to geo-tagged social posts, official traffic handles, and live GPS. Using multilingual event detection and spatio-temporal prediction, it forecasts disruptions from protests, VIP movement, accidents, or road failures **15–30 minutes ahead** — helping commuters, emergency responders, and logistics fleets avoid delays before they happen.

## Problem

Delhi roads block within minutes from: protests · VIP convoys · processions · road cave-ins · flash floods · major accidents. Navigation platforms react to speed data — they recognize congestion **after** it develops. Result: wasted commuter hours, lost ambulance response time, logistics losses, delayed authority awareness. **No system predicts these disruptions before congestion begins.**

**Goal:** convert reactive traffic management into predictive traffic intelligence.

## Target Users

**Primary:** commuters · cab drivers · delivery partners · fleet operators · emergency vehicles.
**Secondary:** Delhi Traffic Police · Smart City authorities · municipal corporations · public transport · insurers.

### Personas
- **Commuter** — fastest route before roads block.
- **Ambulance driver** — predictive rerouting to save lives.
- **Logistics manager** — fleet routing + ETA prediction, fewer SLA breaches.
- **Traffic control room** — city-wide disruption awareness.

## Unique Innovation

Prediction, not reaction. FlowCast combines:
- Multilingual (Hinglish/Hindi) event detection from unstructured posts
- Social-media intelligence as an early signal
- GPS flow-anomaly correlation
- Spatial impact-radius forecasting with a Now → +15/+30 min horizon

The edge: fusing **unstructured social signals** with **structured GPS data** to warn *before* speed data moves.

---

# Phased Feature Plan

Rule: Phase 1 holds only features that are **both** cheap to build **and** win points on stage — heavily favoring native browser APIs (zero deps). Everything that needs real infra, paid data, or ML training is Phase 2. *(Build detail lives in [`plan.md`](./plan.md).)*

## Phase 1 — Build fast, ship, win 🚀

### Core pipeline
| Feature | Effort | Why it wins |
|---|---|---|
| Delhi Leaflet map (dark tiles) + 3 scripted events (CP / ITO / India Gate) | S | City-scale picture, looks pro |
| Event classify — keyword rules + optional LLM (AI Gateway) | S | The "AI" layer, Hinglish-aware |
| Gazetteer geocode | S | Deterministic, offline-safe |
| **Warning→Confirmed** cross-validation (1 signal→yellow, 2→red) | S | Live answer to "fake tweet?" |
| Jam impact-radius + **Now/+15/+30 slider** | S | The before/after — the whole pitch |
| Naive reroute polyline around jam | S | Delivers the "alternate route" promise |
| "Inject event" buttons | S | 100% deterministic stage demo, judge-triggerable |

### Rich adds — MUST (cheap, high-wow, in Phase 1)
| Feature | Effort | Why it wins |
|---|---|---|
| **Live incoming-post feed panel** | S | Makes "social listening" visible and alive |
| **Alert toast** — "Heavy congestion expected in 18 min" | S | The product's actual output, on screen |
| **Event popup** — type · confidence % · signal count · est delay | S | Shows the reasoning, not just a dot |
| **Fake-news demo** — lone unverified post stays yellow, then debunks | S | Turns the hardest judge question into a feature |
| **Impact stats chip** — roads · area km² · est vehicles *(labeled estimate)* | S | Quantifies impact, feels city-scale |

### Rich adds — STRETCH (after core works end-to-end)
| Feature | Effort | Why it wins |
|---|---|---|
| **Voice alert** via Web Speech API (`speechSynthesis`) | S | Native, 0 deps — spoken warning = big wow |
| **Browser push** via Notification API | S | Native, 0 deps — "fleet gets pinged" story |
| Confidence-scaled circle opacity polish | S | Reads severity at a glance |

*S = small, hours. All Phase 1 fits a single Next.js app, no new services.*

## Phase 2 — Hard / time-taking (post-demo roadmap) 🏗

| Feature | Effort | Blocker |
|---|---|---|
| Real social feed — Apify / Nitter → X filtered stream | L | X API paid + approval |
| Live GPS / traffic — TomTom / HERE flow API | L | Rate limits, real-time infra |
| Nominatim geocoding fallback (free-text locations) | S | Only needed once feed is real |
| Real routing engine — OSRM / Mapbox directions | M | Replaces naive reroute line |
| Fine-tuned Hinglish NER — IndicBERT / XLM-R | L | Data + training + GPU |
| Graph jam propagation — NetworkX road network | L | Road-graph data + model |
| Persistence + cache — PostGIS + Redis | M | Only matters at scale |
| Streaming — Kafka / Redpanda | L | Broker ops overhead |
| Fleet dashboard + auth + multi-tenant | L | Full product surface |
| Metro-delay detection · WhatsApp community signals | M | New data integrations |
| Mobile app · Android widget · Google Maps plugin | L | New platforms |
| Multi-city expansion + accuracy backtesting | M | Per-city data + eval harness |

*M = days, L = week+.*

---

## Competitive Analysis

| Feature | Google Maps | Waze | FlowCast |
|---|---|---|---|
| Live traffic | ✅ | ✅ | ✅ |
| Historical patterns | ✅ | ✅ | ✅ |
| Social-media signals | ❌ | ❌ | ✅ |
| Protest / VIP / cave-in prediction | ❌ | ❌ | ✅ |
| Pre-congestion forecast (15–30 min) | ❌ | Limited | ✅ |
| Impact-radius propagation | ❌ | ❌ | ✅ |

## Business Model

- **SaaS** — per-vehicle subscription for logistics, cab, delivery fleets.
- **API licensing** — prediction API for smart cities, government, navigation apps.
- **Enterprise dashboard** — emergency services, fleet managers, control centers.
- **Consumer app** — freemium; premium/ad-supported alerts.

**Market:** Delhivery · Blue Dart · Blinkit · Swiggy · Zomato · Uber · Ola · Delhi Traffic Police · Smart Cities Mission.

## Roadmap

Phase 1 Delhi MVP → Phase 2 NCR → Phase 3 India-wide → Phase 4 global smart cities → Phase 5 autonomous-vehicle integration.

## Risks & Mitigation

| Challenge | Mitigation |
|---|---|
| Noisy / fake social data | Cross-source validation, confidence scoring, Warning→Confirmed gate |
| Accurate location extraction | Gazetteer + (Phase 2) Nominatim; official-handle priority |
| Real-time processing | Poll now; stream at scale |
| Event verification | GPS correlation + duplicate detection |

**Success metrics:** event-detection accuracy · prediction precision · average warning time · route accuracy · API latency · engagement.

## 3-Minute Pitch Structure

- **Hook (20s)** — "What if Maps told you about a jam *before* it exists?"
- **Problem (40s)** — Delhi's sudden disruptions; reactive apps arrive late.
- **Solution (60s)** — FlowCast's social + GPS fusion pipeline.
- **Demo (60s)** — the 6-step script in [`plan.md`](./plan.md), live.
- **Impact (20s)** — commuters, emergency services, fleets.
- **Close (20s)** — "FlowCast doesn't just navigate traffic — it predicts urban mobility."

## Judge Q&A Prep

- **Why AI?** Real-time understanding of multilingual, unstructured social data; warns before GPS speed patterns move.
- **Vs Google Maps?** Maps reacts after congestion forms; we forecast from social + GPS anomalies before it begins.
- **Misinformation?** Confidence scores + GPS/official cross-verification; only corroborated events go Confirmed.
- **Scale?** Modular, city-agnostic — onboard a city by adding local data sources + map layers.
- **"Show me the Kafka / XLM-R."** Honest: MVP runs a lean $0 stack; Kafka/XLM-R/PostGIS are the funded production roadmap. We built the demo, not the datacenter.

## Cheat Sheet

| Category | Summary |
|---|---|
| **Problem** | Navigation apps react too late to sudden disruptions. |
| **Solution** | Predict traffic 15–30 min before congestion via social media + GPS. |
| **Innovation** | Multimodal fusion: event NLP + geospatial + impact-radius propagation. |
| **Build stack** | Next.js, Leaflet, keyword+LLM (AI Gateway), gazetteer, mock feed, Vercel. |
| **Prod stack** | FastAPI, Kafka, XLM-R, NetworkX, PostGIS, TomTom, Mapbox. |
| **Users** | Commuters, fleets, emergency services, traffic authorities. |
| **Model** | SaaS + enterprise dashboards + API licensing + consumer app. |
| **Impact** | Faster emergency response, less travel time, better mobility. |
| **Tagline** | **Predict traffic before it happens.** |
