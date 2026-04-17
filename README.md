# Vyapar — Crypto Market Terminal

**Live → [terminal.swayam.io](https://terminal.swayam.io)**

> A production-grade cryptocurrency market terminal built with Next.js 16, Lightweight Charts, and the CoinGecko API — featuring live-polled prices, interactive candlestick charts, a command palette, and dynamic SEO.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [API Routes](#api-routes)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Data Source & Caching Strategy](#data-source--caching-strategy)
- [SEO](#seo)
- [Security](#security)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

Vyapar (Hindi: *व्यापार*, meaning "trade" or "commerce") is a real-time cryptocurrency market terminal. It lists thousands of coins ranked by market cap, and each coin detail page features a live-updating price header, an interactive OHLC candlestick chart with seven selectable time ranges, a crypto-to-fiat/crypto converter, and a full market stats panel.

The app runs on the CoinGecko free tier — no paid API subscription required. Price data is refreshed every 30 seconds via server-proxied polling, and page data is ISR-cached to stay within free-tier rate limits without sacrificing freshness.

---

## Features

### Market Data

- **Home Dashboard** — Market Overview (top coins by market cap), a Trending Coins panel (most searched today), and a Crypto Categories explorer
- **All Coins List** — Paginated table of up to 2,500 coins (250 pages × 10 per page), showing rank, name/symbol, price, 24h change, and market cap
- **Coin Detail Page** — Full detail view per coin including:
  - Live price header with 24h and 30d change badges (SSR fallback → 30s polling)
  - Interactive candlestick chart with 7 time range buttons: 1D, 1W, 1M, 3M, 6M, 1Y, Max
  - Market stats grid: market cap, 24h volume, 24h high/low, 30d change, all-time high
  - Coin details panel: market cap rank, links to homepage, block explorer, and community
  - Crypto converter widget

### Candlestick Chart

Built with **Lightweight Charts v5** (TradingView's open-source charting library):

- OHLC data fetched via the internal `/api/ohlc` proxy on period change using `useTransition` to avoid blocking the UI
- Granularity is auto-determined by CoinGecko based on the `days` parameter (30-min candles for 1D, 4-hour for 1W–3M, daily for 3M+)
- Chart initializes with SSR-fetched 1D data, then refetches client-side on period switch
- Custom dark theme: `#0c1117` background, green/red candles (`#22c55e` / `#ef4444`), subtle grid and crosshair
- Fully interactive: scroll, pinch-to-zoom, crosshair with price label
- Wrapped in an `ErrorBoundary` to prevent chart errors from crashing the page

### Live Price Polling

CoinGecko WebSocket streams are Pro-only. The `useCoinGeckoWebSocket` hook implements polling instead:

- Fires `GET /api/price` immediately on mount, then every **30 seconds** via `setInterval`
- The `/api/price` route is ISR-cached for **25 seconds** — slightly under the poll interval — so each poll always receives fresh data
- A green/grey indicator dot next to the chart title reflects live connection status
- Falls back to SSR-fetched market data until the first poll resolves — no layout shift

### Command Palette

- Global keyboard shortcut `Ctrl/Cmd + K` opens a cmdk-powered command palette
- Searches coins by name or symbol via the internal `/api/search` proxy
- Results display coin thumb, name, symbol, and market cap rank; selecting navigates to the coin detail page

### UX

- **Dark / Light / System Theme** — `next-themes` with three-way toggle
- **Responsive Layout** — Mobile-first grid that collapses from 3-column to single-column
- **Skeleton Loading** — Suspense fallback components for every async section
- **Error Boundaries** — Per-section `ErrorBoundary` prevents isolated failures from propagating
- **404 / Error Pages** — Custom `not-found.tsx` and `error.tsx` with navigation back to home

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| Charts | Lightweight Charts v5 (TradingView) |
| Command Palette | cmdk v1 |
| State Management | Zustand v5 |
| Icons | Lucide React |
| HTTP Client | Native `fetch` with Next.js cache integration |
| Linting | ESLint 9 + `eslint-config-next` |
| Formatting | Prettier with `prettier-plugin-tailwindcss` |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Next.js App Router                            │
│                                                                      │
│  ┌────────────────┐  ┌──────────────────────────┐  ┌─────────────┐  │
│  │   / (Home)     │  │   /coins/[id] (Detail)   │  │  /coins     │  │
│  │                │  │                          │  │  (List)     │  │
│  │  SSR + Suspense│  │  SSR + ISR (60s)         │  │  ISR (30s)  │  │
│  │  CoinOverview  │  │  ┌──────────────────────┐│  │  DataTable  │  │
│  │  TrendingCoins │  │  │ LiveMarketWrapper     ││  │  Pagination │  │
│  │  Categories    │  │  │ (Client Component)    ││  └─────────────┘  │
│  └────────────────┘  │  │  - CoinHeader         ││                   │
│                      │  │  - CandlestickChart   ││                   │
│                      │  │  - MarketStats        ││                   │
│                      │  └──────────────────────┘│                   │
│                      │  CryptoConverter          │                   │
│                      │  CoinDetails panel        │                   │
│                      └──────────────────────────┘                   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                     API Routes (Server Proxy)                │    │
│  │  /api/ohlc    (OHLC candles,  ISR 60s, input validation)    │    │
│  │  /api/price   (live price,    ISR 25s, 30s client poll)     │    │
│  │  /api/search  (coin search,   ISR 60s)                      │    │
│  └──────────────────────────┬─────────────────────────────────-┘    │
└───────────────────────────  │ ────────────────────────────────────────┘
                              │ coingecko-client (fetch + 10s timeout)
                    ┌─────────▼──────────┐
                    │  CoinGecko API v3  │
                    │  (Free / Demo tier)│
                    │  /coins/markets    │
                    │  /coins/{id}       │
                    │  /coins/{id}/ohlc  │
                    │  /simple/price     │
                    │  /search           │
                    │  /search/trending  │
                    │  /coins/categories │
                    └────────────────────┘
```

**Server / Client split:** All data-fetching pages are React Server Components that fetch directly via `coingecko-client` on the server. The `LiveMarketWrapper` is the only client island on the coin detail page — it owns the polling loop and passes live data down to child components. The `CandlestickChart` is dynamically imported with `ssr: false` (via `CandlestickChartClient`) because Lightweight Charts uses browser canvas APIs.

---

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── ohlc/route.ts          # OHLC candlestick data proxy
│   │   ├── price/route.ts         # Live price polling proxy (ISR 25s)
│   │   └── search/route.ts        # Coin search proxy
│   ├── coins/
│   │   ├── page.tsx               # Paginated coins list (ISR 30s)
│   │   └── [id]/page.tsx          # Coin detail page (ISR 60s) + JSON-LD
│   ├── error.tsx                  # Root error boundary
│   ├── globals.css                # Tailwind base + CSS custom properties
│   ├── layout.tsx                 # Root layout (theme provider, header, footer)
│   ├── not-found.tsx              # 404 page
│   ├── page.tsx                   # Home dashboard (Suspense sections)
│   ├── robots.ts                  # robots.txt generation
│   └── sitemap.ts                 # Dynamic sitemap (top 250 coins)
├── components/
│   ├── charts/
│   │   ├── CandlestickChart.tsx        # Lightweight Charts implementation
│   │   └── CandlestickChartClient.tsx  # dynamic(ssr:false) wrapper
│   ├── coins/
│   │   ├── CoinHeader.tsx         # Live price + change badges
│   │   └── CoinsPagination.tsx    # Page navigation controls
│   ├── converter/
│   │   └── CryptoConverter.tsx    # Crypto ↔ fiat/crypto converter widget
│   ├── home/
│   │   ├── CoinOverview.tsx       # Top coins market overview
│   │   ├── TrendingCoins.tsx      # Trending coins panel
│   │   ├── Categories.tsx         # Crypto categories explorer
│   │   └── fallback.tsx           # Suspense skeleton fallbacks
│   ├── layout/
│   │   ├── Header.tsx             # Navigation + command palette trigger + theme toggle
│   │   └── Footer.tsx
│   ├── realtime/
│   │   └── LiveMarketWrapper.tsx  # Client island: polling + chart + stats
│   ├── tables/
│   │   └── DataTable.tsx          # Generic typed table component
│   └── ui/                        # shadcn/ui primitives + custom components
│       ├── command-palette.tsx    # Cmdk-powered global search (Ctrl+K)
│       ├── error-boundary.tsx
│       ├── error-state.tsx
│       └── ...
├── constants/
│   └── index.ts                   # Chart config, period config, nav items
├── hooks/
│   └── useCoinGeckoWebSocket.ts   # Price polling hook (30s interval)
├── lib/
│   ├── coingecko-client.ts        # Base fetcher (timeout, error handling, cache)
│   ├── command-palette-store.ts   # Zustand store for palette open state
│   └── utils.ts                   # cn(), formatCurrency(), formatPercentage(), convertOHLCData()
├── types/
│   ├── coin.ts                    # CoinMarketData, CoinDetailsData, TrendingCoin
│   ├── chart.ts                   # OHLCData, CandlestickChartProps
│   ├── websocket.ts               # ExtendedPriceData, Trade (legacy WS types)
│   ├── api.ts                     # QueryParams, CoinGeckoErrorBody
│   ├── market.ts                  # Market-level types
│   ├── pagination.ts              # Pagination props
│   ├── table.ts                   # DataTableColumn generic
│   ├── ui.ts                      # LiveDataProps
│   └── index.ts                   # Re-exports
├── next.config.ts                 # Security headers, image domains, ISR
└── package.json
```

---

## Pages & Routes

| Route | Rendering | Revalidation | Description |
|---|---|---|---|
| `/` | RSC + Suspense | On demand | Home dashboard: market overview, trending, categories |
| `/coins` | ISR | 30 seconds | Paginated coin list, 10 per page, up to 250 pages |
| `/coins/[id]` | ISR | 60 seconds | Coin detail: chart, live price, stats, converter |

---

## API Routes

All routes are internal server proxies — the CoinGecko API key is never exposed to the browser.

| Route | Cache | Description |
|---|---|---|
| `GET /api/ohlc?coinId=&days=` | ISR 60s | OHLC candlestick data for a given coin and period |
| `GET /api/price?coinId=` | ISR 25s | Live price, 24h change, market cap, volume |
| `GET /api/search?q=` | ISR 60s | Coin search by name or symbol |

All routes validate inputs (`coinId` against `/^[a-z0-9-]+$/`, `days` against an allowlist) before forwarding to CoinGecko.

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [CoinGecko Demo API key](https://www.coingecko.com/en/api) (free — optional but recommended for higher rate limits)

### Installation

```bash
git clone https://github.com/your-username/vyapar.git
cd vyapar
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# CoinGecko — https://www.coingecko.com/en/api
# Optional: omitting it still works but uses the public unauthenticated endpoint
# (lower rate limits: ~10–30 calls/min vs 30 calls/min with Demo key)
COINGECKO_API_KEY=CG-...
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3

# Your production URL — used for OG tags, sitemap, and JSON-LD
NEXT_PUBLIC_APP_URL=https://terminal.swayam.io
```

The `COINGECKO_API_KEY` is attached as `x-cg-demo-api-key` on server-side requests only. It is never sent to the client.

---

## Data Source & Caching Strategy

All data comes from the **CoinGecko Public API v3 (free / Demo tier)**. The caching model is designed to maximize freshness while staying within free-tier rate limits:

| Data | Fetch location | Cache TTL | Notes |
|---|---|---|---|
| Coin list (`/coins/markets`) | Server (ISR) | 30s | Revalidated by Next.js ISR |
| Coin details (`/coins/{id}`) | Server (ISR) | 60s | SSR fallback until revalidation |
| OHLC candles (`/coins/{id}/ohlc`) | `/api/ohlc` | 60s | Fetched client-side on period change |
| Live price (`/simple/price`) | `/api/price` | 25s | Polled every 30s from client |
| Trending (`/search/trending`) | Server (ISR) | On demand | |
| Categories (`/coins/categories`) | Server (ISR) | On demand | |
| Search (`/search`) | `/api/search` | 60s | Triggered by command palette |

The `coingecko-client` fetcher uses a **10-second `AbortController` timeout** on every request to prevent slow API responses from hanging server renders. OHLC candle granularity is auto-determined by CoinGecko based on `days` — the `interval` and `precision` parameters are Pro-only and are not sent.

---

## SEO

- **Dynamic Metadata** — Each `/coins/[id]` page generates a `<title>` and `<description>` tag with the coin name, symbol, and live price via `generateMetadata`
- **Open Graph & Twitter Cards** — `og:title`, `og:description`, `og:url`, `og:type`, and `twitter:card` tags on all coin pages
- **JSON-LD Structured Data** — `FinancialProduct` schema injected via `<script type="application/ld+json">` on coin detail pages with name, description, image, and current price
- **Dynamic Sitemap** — `/sitemap.xml` is generated at build time from the top 250 coins by market cap, with `changeFrequency: "hourly"` and `priority` values tuned per route type
- **robots.txt** — Generated via `app/robots.ts`

---

## Security

Security headers are applied globally via `next.config.ts`:

| Header | Value |
|---|---|
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Cache-Control` (static assets) | `public, max-age=31536000, immutable` |

The CoinGecko API key lives server-side only. All three API routes validate and sanitize query parameters before forwarding requests, preventing path traversal or injection through the `coinId` parameter.

---

## Deployment

The app is live at **[terminal.swayam.io](https://terminal.swayam.io)**.

For self-hosted deployments, this is a standard Next.js application compatible with Vercel, Railway, Render, Fly.io, or any Node.js 20+ host. Ensure all environment variables from the [Environment Variables](#environment-variables) section are configured on your platform.

---

## Contributing

1. Fork the repository and create a feature branch (`git checkout -b feat/my-feature`).
2. Run `npm run lint` and `npm run build` before opening a pull request.
3. Follow the existing code style — Prettier is configured with `prettier-plugin-tailwindcss`.

Bug reports and feature requests are welcome via GitHub Issues.

---

## License

This project is private. All rights reserved.
