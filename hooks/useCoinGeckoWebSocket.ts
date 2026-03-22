"use client";

import { useEffect, useRef, useState } from "react";

import {
  ExtendedPriceData,
  OHLCData,
  Trade,
  WebSocketMessage,
  UseCoinGeckoWebSocketProps,
  UseCoinGeckoWebSocketReturn,
} from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL;
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;

const WS_BASE =
  WS_URL && API_KEY ? `${WS_URL}?x_cg_pro_api_key=${API_KEY}` : null;

export const useCoinGeckoWebSocket = ({
  coinId,
  poolId,
  liveInterval,
}: UseCoinGeckoWebSocketProps): UseCoinGeckoWebSocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscribed = useRef<Set<string>>(new Set());
  const isUnmounted = useRef(false);

  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  /* =========================
     CONNECT
  ========================== */
  const connect = () => {
    if (!WS_BASE || wsRef.current || isUnmounted.current) return;

    const ws = new WebSocket(WS_BASE);
    wsRef.current = ws;

    const safeSend = (payload: Record<string, unknown>) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
      }
    };

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event: MessageEvent) => {
      let msg: WebSocketMessage | null = null;

      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      if (!msg) return;

      /* Ping */
      if (msg.type === "ping") {
        safeSend({ type: "pong" });
        return;
      }

      /* Subscription confirm */
      if (msg.type === "confirm_subscription") {
        try {
          const { channel } = JSON.parse(msg.identifier ?? "");
          subscribed.current.add(channel);
        } catch {}
      }

      /* Price */
      if (msg.c === "C1") {
        setPrice({
          usd: msg.p ?? 0,
          coin: msg.i,
          price: msg.p,
          change24h: msg.pp,
          marketCap: msg.m,
          volume24h: msg.v,
          timestamp: msg.t,
        });
      }

      /* Trades */
      if (msg.c === "G2") {
        const trade: Trade = {
          price: msg.pu,
          value: msg.vo,
          timestamp: msg.t ?? 0,
          type: msg.ty,
          amount: msg.to,
        };

        setTrades((prev) => [trade, ...prev].slice(0, 20));
      }

      /* OHLCV */
      if (msg.ch === "G3") {
        const candle: OHLCData = [
          msg.t ?? 0,
          Number(msg.o ?? 0),
          Number(msg.h ?? 0),
          Number(msg.l ?? 0),
          Number(msg.c ?? 0),
        ];

        setOhlcv(candle);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      subscribed.current.clear();

      if (!isUnmounted.current) {
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  };

  /* =========================
     INIT
  ========================== */
  useEffect(() => {
    isUnmounted.current = false;
    connect();

    return () => {
      isUnmounted.current = true;

      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }

      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  /* =========================
     SUBSCRIPTIONS
  ========================== */
  useEffect(() => {
    if (!isConnected || !wsRef.current) return;

    const ws = wsRef.current;

    const safeSend = (payload: Record<string, unknown>) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
      }
    };

    const unsubscribeAll = () => {
      subscribed.current.forEach((channel) => {
        safeSend({
          command: "unsubscribe",
          identifier: JSON.stringify({ channel }),
        });
      });

      subscribed.current.clear();
    };

    const subscribe = (channel: string, data?: Record<string, unknown>) => {
      if (subscribed.current.has(channel)) return;

      safeSend({
        command: "subscribe",
        identifier: JSON.stringify({ channel }),
      });

      if (data) {
        safeSend({
          command: "message",
          identifier: JSON.stringify({ channel }),
          data: JSON.stringify(data),
        });
      }
    };

    /* Reset */
    setPrice(null);
    setTrades([]);
    setOhlcv(null);

    unsubscribeAll();

    /* Price */
    subscribe("CGSimplePrice", {
      coin_id: [coinId],
      action: "set_tokens",
    });

    const poolAddress = poolId?.replace("_", ":") ?? "";

    if (poolAddress) {
      subscribe("OnchainTrade", {
        "network_id:pool_addresses": [poolAddress],
        action: "set_pools",
      });

      subscribe("OnchainOHLCV", {
        "network_id:pool_addresses": [poolAddress],
        interval: liveInterval,
        action: "set_pools",
      });
    }
  }, [coinId, poolId, liveInterval, isConnected]);

  return {
    price,
    trades,
    ohlcv,
    isConnected,
  };
};
