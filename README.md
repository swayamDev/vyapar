# Vyapar — Crypto Market Tracker

A production-grade cryptocurrency dashboard built with Next.js 15, React 19, TailwindCSS v4, and the CoinGecko API.

## Features

- **Homepage**: Live market overview, trending coins, category breakdown
- **All Coins**: Paginated list of all cryptocurrencies with search
- **Coin Detail**: Real-time candlestick chart, live trade feed via WebSocket, currency converter
- **Command Palette** (⌘K): Search any coin instantly
- **Dark / Light theme**

## Getting Started

### 1. Clone & install

```bash
git clone <repo>
cd vyapar
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your CoinGecko API key. You need a **Pro** account for WebSocket and on-chain data. The basic REST endpoints work with a free API key.

| Variable | Description |
|---|---|
| `COINGECKO_BASE_URL` | `https://pro-api.coingecko.com/api/v3` |
| `COINGECKO_API_KEY` | Your CoinGecko Pro API key (server-side) |
| `NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL` | `wss://streams.coingecko.com/v1/cable` |
| `NEXT_PUBLIC_COINGECKO_API_KEY` | Your CoinGecko Pro API key (client-side, for WS) |

### 3. Run

```bash
npm run dev       # Development
npm run build     # Production build
npm run start     # Production server
```

## Architecture

```
app/
  page.tsx              # Home — SSR with Suspense boundaries
  coins/
    page.tsx            # All Coins — paginated SSR
    [id]/page.tsx       # Coin Detail — SSR + client WS
  api/
    ohlc/route.ts       # OHLC proxy (server-side API key)
    search/route.ts     # Coin search proxy

components/
  charts/               # CandlestickChart (lightweight-charts)
  coins/                # CoinHeader, CoinsPagination
  converter/            # CryptoConverter
  home/                 # CoinOverview, TrendingCoins, Categories, fallbacks
  layout/               # Header, Footer
  realtime/             # LiveMarketWrapper (WebSocket consumer)
  tables/               # DataTable generic
  ui/                   # shadcn/ui components + CommandPalette

hooks/
  useCoinGeckoWebSocket.ts  # WebSocket hook with reconnect logic

lib/
  coingecko-client.ts   # Typed fetch wrapper with timeout + cache
  utils.ts              # Formatters, OHLC converter, pagination
  command-palette-store.ts  # Zustand store for ⌘K

types/                  # All shared TypeScript interfaces
constants/              # Chart config, period/interval maps
```

## Notes

- Real-time trades and OHLCV require a CoinGecko Pro WebSocket subscription
- The coin detail chart falls back to static OHLC data if WebSocket is unavailable
- Pagination is capped at 250 pages (CoinGecko free tier limit)
