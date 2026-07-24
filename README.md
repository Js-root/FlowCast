# FlowCast

Predictive traffic disruption forecasting and AI-optimized route planning for Delhi NCR.

FlowCast synthesizes real-time social telemetry and neural cascade modeling to forecast municipal gridlock 30 minutes before maps turn red.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and set your `GROQ_API_KEY`:
   ```bash
   cp .env.example .env.local
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

The local server will be accessible at `http://localhost:3000`.
