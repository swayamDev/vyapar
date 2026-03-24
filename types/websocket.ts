import { OHLCData } from "./chart";

// WebSocket types kept for potential future Pro upgrade, but the app
// currently uses REST polling on the free tier.

export interface Trade {
  price?: number;
  timestamp?: number;
  type?: "b" | "s" | string;
  amount?: number;
  value?: number;
}

export interface ExtendedPriceData {
  usd: number;
  coin?: string;
  price?: number;
  change24h?: number;
  marketCap?: number;
  volume24h?: number;
  timestamp?: number;
}

// Legacy WS types — not used on free tier
export interface WebSocketMessage {
  type?: string;
  c?: string;
  ch?: string;
  i?: string;
  p?: number;
  pp?: number;
  pu?: number;
  m?: number;
  v?: number;
  vo?: number;
  o?: number;
  h?: number;
  l?: number;
  c2?: number;
  t?: number;
  to?: number;
  ty?: string;
  identifier?: string;
}

export interface UseCoinGeckoWebSocketProps {
  coinId: string;
  poolId?: string;
  liveInterval?: "1s" | "1m";
}

export interface UseCoinGeckoWebSocketReturn {
  price: ExtendedPriceData | null;
  trades: Trade[];
  ohlcv: OHLCData | null;
  isConnected: boolean;
}
