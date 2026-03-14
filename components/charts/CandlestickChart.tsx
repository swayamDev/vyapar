"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
} from "lightweight-charts";

import { CandlestickChartProps, Period, OHLCData } from "@/types";
import { fetcher } from "@/lib/coingecko-client";
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

  const fetchOHLCData = async (selectedPeriod: Period) => {
    try {
      const { days, interval } = PERIOD_CONFIG[selectedPeriod];

      const newData = await fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
        vs_currency: "usd",
        days,
        interval,
        precision: "full",
      });

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

  /* Chart initialization */
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const showTime = ["daily", "weekly", "monthly"].includes(period);

    const chart = createChart(container, {
      ...getChartConfig(height, showTime),
      width: container.clientWidth,
    });

    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());

    const converted = convertOHLCData(
      ohlcData.map(
        (item) =>
          [
            Math.floor(item[0] / 1000),
            item[1],
            item[2],
            item[3],
            item[4],
          ] as OHLCData,
      ),
    );

    series.setData(converted);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleSeriesRef.current = series;

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;
      chart.applyOptions({
        width: entries[0].contentRect.width,
      });
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [height, period]);

  /* Data updates */
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const convertedToSeconds = ohlcData.map(
      (item) =>
        [
          Math.floor(item[0] / 1000),
          item[1],
          item[2],
          item[3],
          item[4],
        ] as OHLCData,
    );

    let merged: OHLCData[];

    if (liveOhlcv) {
      const liveTimestamp = liveOhlcv[0];
      const lastHistorical = convertedToSeconds[convertedToSeconds.length - 1];

      if (lastHistorical && lastHistorical[0] === liveTimestamp) {
        merged = [...convertedToSeconds.slice(0, -1), liveOhlcv];
      } else {
        merged = [...convertedToSeconds, liveOhlcv];
      }
    } else {
      merged = convertedToSeconds;
    }

    merged.sort((a, b) => a[0] - b[0]);

    const converted = convertOHLCData(merged);
    candleSeriesRef.current.setData(converted);

    const dataChanged = prevOhlcDataLength.current !== ohlcData.length;

    if (dataChanged || mode === "historical") {
      chartRef.current?.timeScale().fitContent();
      prevOhlcDataLength.current = ohlcData.length;
    }
  }, [ohlcData, period, liveOhlcv, mode]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left slot (coin info) */}
        <div className="flex-1">{children}</div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Period Selector */}
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

          {/* Live Interval */}
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
                    onClick={() => setLiveInterval && setLiveInterval(value)}
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
