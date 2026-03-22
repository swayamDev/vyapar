"use client";

import { useEffect, useRef, useState, useTransition, useMemo } from "react";

import {
  getCandlestickConfig,
  getChartConfig,
  LIVE_INTERVAL_BUTTONS,
  PERIOD_BUTTONS,
  PERIOD_CONFIG,
} from "@/constants";

import {
  CandlestickSeries,
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from "lightweight-charts";

import { CandlestickChartProps, Period, OHLCData } from "@/types";
import { convertOHLCData } from "@/lib/utils";

const CandlestickChart = ({
  children,
  data,
  coinId,
  height = 360,
  initialPeriod = "daily",
  liveOhlcv = null,
  mode = "historical",
  liveInterval,
  setLiveInterval,
}: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const prevOhlcDataLength = useRef<number>(data?.length || 0);

  const [period, setPeriod] = useState(initialPeriod);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
  const [isPending, startTransition] = useTransition();

  /* =========================
     Fetch OHLC (SAFE CLIENT)
  ========================== */
  const fetchOHLCData = async (selectedPeriod: Period) => {
    try {
      const { days, interval } = PERIOD_CONFIG[selectedPeriod];

      const res = await fetch(
        `/api/ohlc?coinId=${coinId}&days=${days}&interval=${interval}`,
      );

      const newData = await res.json();

      startTransition(() => {
        setOhlcData(newData ?? []);
      });
    } catch (e) {
      console.error("Failed to fetch OHLCData", e);
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    fetchOHLCData(newPeriod);
  };

  /* =========================
     Memoized Data (PERF)
  ========================== */
  const convertedData = useMemo(() => {
    return convertOHLCData(
      ohlcData.map((item) => [
        Math.floor(item[0] / 1000),
        item[1],
        item[2],
        item[3],
        item[4],
      ]),
    );
  }, [ohlcData]);

  /* =========================
     Chart Init (ONLY ONCE)
  ========================== */
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      ...getChartConfig(height, true),
      width: container.clientWidth,
    });

    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());

    chartRef.current = chart;
    candleSeriesRef.current = series;

    /* Resize observer (optimized) */
    let frameId: number;

    const observer = new ResizeObserver((entries) => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        chart.applyOptions({
          width: entries[0].contentRect.width,
        });
      });
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [height]);

  /* =========================
     Set Data (FAST UPDATE)
  ========================== */
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    candleSeriesRef.current.setData(convertedData);

    const dataChanged = prevOhlcDataLength.current !== ohlcData.length;

    if (dataChanged || mode === "historical") {
      chartRef.current?.timeScale().fitContent();
      prevOhlcDataLength.current = ohlcData.length;
    }
  }, [convertedData, mode, ohlcData.length]);

  /* =========================
     Live Update (SMOOTH)
  ========================== */
  useEffect(() => {
    if (!liveOhlcv || !candleSeriesRef.current) return;

    const live = {
      time: Math.floor(liveOhlcv[0] / 1000) as UTCTimestamp,
      open: liveOhlcv[1],
      high: liveOhlcv[2],
      low: liveOhlcv[3],
      close: liveOhlcv[4],
    };

    candleSeriesRef.current.update(live);
  }, [liveOhlcv]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left slot */}
        <div className="flex-1">{children}</div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Period */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium">
              Period
            </span>

            <div className="border-border flex overflow-hidden rounded-lg border">
              {PERIOD_BUTTONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handlePeriodChange(value)}
                  disabled={isPending}
                  className={`px-3 py-1.5 text-xs font-medium transition ${
                    period === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Live */}
          {liveInterval !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs font-medium">
                Live
              </span>

              <div className="border-border flex overflow-hidden rounded-lg border">
                {LIVE_INTERVAL_BUTTONS.map(({ value, label }) => (
                  <button
                    key={value}
                    disabled={isPending}
                    onClick={() => setLiveInterval?.(value)}
                    className={`px-3 py-1.5 text-xs font-medium transition ${
                      liveInterval === value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {isPending && (
        <div className="text-muted-foreground text-xs">Loading...</div>
      )}

      {/* Chart */}
      <div
        ref={chartContainerRef}
        className="border-border bg-card w-full rounded-xl border"
        style={{ height }}
      />
    </div>
  );
};

export default CandlestickChart;
