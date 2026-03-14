"use client";

import { useEffect, useRef, useState } from "react";

const WS_BASE = `${process.env.NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL}?x_cg_pro_api_key=${process.env.NEXT_PUBLIC_COINGECKO_API_KEY}`;

export const useCoinGeckoWebSocket = ({
  coinId,
  poolId,
  liveInterval,
}: UseCoinGeckoWebSocketProps): UseCoinGeckoWebSocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const subscribed = useRef<Set<string>>(new Set());

  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = () => {
    if (wsRef.current) return;

    const ws = new WebSocket(WS_BASE);
    wsRef.current = ws;

    const send = (payload: Record<string, unknown>) => {
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

      /* Ping/Pong */
      if (msg.type === "ping") {
        send({ type: "pong" });
        return;
      }

      /* Confirm subscription */
      if (msg.type === "confirm_subscription") {
        try {
          const { channel } = JSON.parse(msg.identifier ?? "");
          subscribed.current.add(channel);
        } catch {}
      }

      /* Price updates */
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

      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  };

  /* Initial connection */
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  /* Subscriptions */
  useEffect(() => {
    if (!isConnected || !wsRef.current) return;

    const ws = wsRef.current;

    const send = (payload: Record<string, unknown>) =>
      ws.send(JSON.stringify(payload));

    const unsubscribeAll = () => {
      subscribed.current.forEach((channel) => {
        send({
          command: "unsubscribe",
          identifier: JSON.stringify({ channel }),
        });
      });

      subscribed.current.clear();
    };

    const subscribe = (channel: string, data?: Record<string, unknown>) => {
      if (subscribed.current.has(channel)) return;

      send({
        command: "subscribe",
        identifier: JSON.stringify({ channel }),
      });

      if (data) {
        send({
          command: "message",
          identifier: JSON.stringify({ channel }),
          data: JSON.stringify(data),
        });
      }
    };

    /* Reset state */
    setPrice(null);
    setTrades([]);
    setOhlcv(null);

    unsubscribeAll();

    /* Price channel */
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
