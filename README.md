# Subdomain Finder

A fast, production-ready subdomain enumeration tool powered by Cloudflare's edge network. Discover subdomains from OSINT sources (Certificate Transparency + HackerTarget DNS), resolve DNS records, and get results cached at the edge for instant repeat lookups.

**Live:** [subdomainfinder.yashlunawat.com](https://subdomainfinder.yashlunawat.com)

---

## Architecture

```
Browser
  │
  ├─ GET /api/scan/:domain           ← instant (cache check)
  │     │
  │     ├─ X-Cache: HIT   ──────────► Return results from KV immediately
  │     ├─ X-Cache: STALE ──────────► Return old results + show refresh banner
  │     └─ X-Cache: MISS  ──────────► Open SSE stream →
  │                                        Worker queries crt.sh (parallel)
  │                                        Worker queries HackerTarget (parallel)
  │                                        Streams each subdomain as found
  │                                        Resolves DNS via 1.1.1.1 at CF edge
  │                                        Writes results to KV
  │                                        Sends { event: "complete" }
  │
  └─ POST /api/scan/:domain/refresh  ← manual cache refresh
```

### Cache tiers (Cloudflare KV)

| Age | Status | Behavior |
|-----|--------|----------|
| < 24 hours | HIT | Returned instantly, no scan |
| 24h – 7 days | STALE | Returned instantly + stale banner shown |
| > 7 days / never | MISS | Fresh SSE scan triggered |

---

## Cloudflare Products Used

| Product | Purpose |
|---------|---------|
| **Workers** | API server (Hono), OSINT queries, DNS resolution |
| **KV** | Scan result cache with 7-day TTL |
| **D1** | User accounts and scan history (SQLite) |
| **Pages** | Frontend hosting |

> Queues (background stale refresh) require the Workers Paid plan and can be enabled by adding the `[[queues]]` bindings to `wrangler.toml`.

---

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- TanStack Query
- Lucide icons

**Backend (Cloudflare Workers)**
- Hono (lightweight web framework)
- Cloudflare KV (scan cache)
- Cloudflare D1 (SQLite database)
- DNS-over-HTTPS via `1.1.1.1` (internal CF network)

**OSINT Sources**
- [crt.sh](https://crt.sh) — Certificate Transparency logs
- [HackerTarget](https://hackertarget.com) — DNS search API

---

## Project Structure

```
subdomain-finder/
├── src/                          # React frontend
│   ├── pages/
│   │   └── Scanner.tsx           # Main scan UI
│   ├── store/
│   │   └── scanStore.ts          # Zustand store (two-phase: cache → SSE)
│   ├── lib/services/
│   │   └── scanApiService.ts     # Typed API client + fetch-based SSE
│   └── components/
│       ├── scanner/
│       │   ├── ScanForm.tsx
│       │   ├── ScanProgress.tsx
│       │   ├── ScanControls.tsx
│       │   └── StaleCacheBanner.tsx  # Shows age of cached results
│       └── results/
│           ├── ResultsTable.tsx
│           └── ExportButtons.tsx
│
└── api/                          # Cloudflare Worker
    ├── wrangler.toml             # Worker config (KV, D1 bindings)
    ├── schema.sql                # D1 schema
    └── src/
        ├── index.ts              # Hono app + queue consumer export
        ├── types.ts              # Env, KVCacheEntry, SSEEvent types
        ├── routes/
        │   └── scanRoutes.ts     # GET /:domain, GET /:domain/stream, POST /:domain/refresh
        └── services/
            ├── cacheService.ts   # KV read/write, HIT/STALE/MISS logic
            ├── osintService.ts   # crt.sh + HackerTarget (server-side, no CORS proxy)
            ├── dnsWorker.ts      # DNS resolution via 1.1.1.1 at CF edge
            └── scanRunner.ts     # Shared executor (SSE + Queue consumer)
```

---

## Local Development

**Prerequisites:** Node.js 18+, a Cloudflare account with `wrangler` authenticated.

```bash
# 1. Install dependencies
npm install
cd api && npm install && cd ..

# 2. Start the Worker (port 8787)
cd api && npx wrangler dev

# 3. In a separate terminal, start the frontend (port 5173)
npm run dev
```

The frontend reads `VITE_API_BASE_URL` from `.env`. Copy `.env.example`:

```bash
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:8787
```

Local `wrangler dev` simulates KV and D1 in `.wrangler/state/` — no cloud resources needed for local development.

---

## Deployment

### 1. First-time setup (one-time)

```bash
cd api

# Create KV namespace
npx wrangler kv:namespace create SCAN_CACHE
npx wrangler kv:namespace create SCAN_CACHE --preview
# Paste the returned IDs into api/wrangler.toml

# Create D1 database
npx wrangler d1 create subdomain-finder-db
# Paste the returned ID into api/wrangler.toml

# Run schema migration
npx wrangler d1 execute subdomain-finder-db --remote --file=./schema.sql
```

### 2. Deploy the Worker

```bash
cd api && npx wrangler deploy
```

### 3. Build and deploy the frontend

```bash
VITE_API_BASE_URL=https://<your-worker>.workers.dev npx vite build
CLOUDFLARE_ACCOUNT_ID=<your-account-id> npx wrangler pages deploy dist --project-name subdomain-finder
```

---

## API Reference

### `GET /api/scan/:domain`

Returns cached scan results instantly.

**Response headers:**
- `X-Cache: HIT | STALE | MISS`
- `X-Cache-Age: <seconds>`

**Response body:**
```json
{
  "results": [
    {
      "subdomain": "api.example.com",
      "ipAddresses": ["1.2.3.4"],
      "source": "crtsh",
      "resolved": true,
      "discoveredAt": 1714000000000
    }
  ],
  "meta": {
    "fetchedAt": 1714000000000,
    "status": "HIT"
  }
}
```

### `GET /api/scan/:domain/stream`

Server-Sent Events stream of a live scan. Redirects to `GET /api/scan/:domain` if a fresh cache entry already exists.

**Query params:** `sources=crtsh,hackertarget` · `resolveDns=true|false`

**SSE events:**
```
data: {"event":"progress","message":"Querying crt.sh...","percent":10}
data: {"event":"subdomain","subdomain":"api.example.com","ipAddresses":[],"source":"crtsh","resolved":false}
data: {"event":"subdomain","subdomain":"api.example.com","ipAddresses":["1.2.3.4"],"source":"crtsh","resolved":true}
data: {"event":"complete","total":42,"resolved":38,"cachedAt":1714000000000}
```

### `POST /api/scan/:domain/refresh`

Manually triggers a fresh scan. Returns `202` when Queues are not configured (free plan); the frontend opens an SSE stream in that case.

---

## Features

- **Instant repeat lookups** — KV cache means second visits to any domain are sub-100ms
- **Live streaming** — results appear as each OSINT source responds, not after everything finishes
- **DNS resolution at the edge** — resolved via `1.1.1.1` on Cloudflare's internal network
- **No CORS proxies** — all external API calls happen server-side in the Worker
- **Stale-while-revalidate** — old results shown immediately with a banner showing cache age
- **Pause / Resume / Stop** — AbortController on the SSE connection; Worker continues scanning and writes to KV
- **Export** — JSON, CSV, plain-text, or copy to clipboard
- **URL sharing** — `/scan/:domain` auto-starts a scan on load

---

## Legal Disclaimer

This tool is provided for authorized security testing, research, and educational purposes only. Always obtain explicit permission before scanning domains you do not own. The authors are not responsible for any misuse.
