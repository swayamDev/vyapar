"use client";

// NOTE: CoinGecko WebSocket streams are a Pro-only feature.
// On the free tier we poll /simple/price every 30 seconds instead.

import { useEffect, useRef, useState, useCallback } from "react";
import { ExtendedPriceData } from "@/types";

const POLL_INTERVAL_MS = 30_000;

export interface UsePricePollingProps {
  coinId: string;
}

export interface UsePricePollingReturn {
  price: ExtendedPriceData | null;
  isConnected: boolean; // "connected" = last poll succeeded
}

export const useCoinGeckoWebSocket = ({
  coinId,
}: UsePricePollingProps): UsePricePollingReturn => {
  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isUnmounted = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/price?coinId=${encodeURIComponent(coinId)}`,
        { cache: "no-store" },
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const coin = data[coinId];

      if (!coin || isUnmounted.current) return;

      setPrice({
        usd: coin.usd ?? 0,
        price: coin.usd ?? 0,
        change24h: coin.usd_24h_change ?? 0,
        marketCap: coin.usd_market_cap ?? 0,
        volume24h: coin.usd_24h_vol ?? 0,
        timestamp: Date.now(),
      });

      setIsConnected(true);
    } catch {
      if (!isUnmounted.current) setIsConnected(false);
    }
  }, [coinId]);

  useEffect(() => {
    isUnmounted.current = false;

    // Fetch immediately, then poll
    fetchPrice();

    timerRef.current = setInterval(fetchPrice, POLL_INTERVAL_MS);

    return () => {
      isUnmounted.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchPrice]);

  return { price, isConnected };
};
