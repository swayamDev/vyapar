"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  useMemo,
  useCallback,
} from "react";

import {
  getCandlestickConfig,
  getChartConfig,
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
import { convertOHLCData } from "@/lib/utils";

const CandlestickChart = ({
  children,
  data = [],
  coinId,
  height = 360,
  initialPeriod = "daily",
}: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const prevDataLengthRef = useRef<number>(data.length);
  const isChartReadyRef = useRef(false);

  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data);
  const [isPending, startTransition] = useTransition();
  const [chartError, setChartError] = useState<string | null>(null);

  const fetchOHLCData = useCallback(
    async (selectedPeriod: Period) => {
      try {
        const { days } = PERIOD_CONFIG[selectedPeriod];
        const res = await fetch(`/api/ohlc?coinId=${coinId}&days=${days}`);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        if (!Array.isArray(json)) {
          throw new Error(json?.error ?? "Invalid OHLC data");
        }

        startTransition(() => {
          setOhlcData(json);
          setChartError(null);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load chart data";
        console.error("Failed to fetch OHLC data:", e);
        setChartError(msg);
      }
    },
    [coinId],
  );

  const handlePeriodChange = useCallback(
    (newPeriod: Period) => {
      if (newPeriod === period) return;
      setPeriod(newPeriod);
      fetchOHLCData(newPeriod);
    },
    [period, fetchOHLCData],
  );

  const convertedData = useMemo(() => convertOHLCData(ohlcData), [ohlcData]);

  /* Chart initialization */
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    let chart: IChartApi;

    try {
      chart = createChart(container, {
        ...getChartConfig(height, true),
        width: container.clientWidth,
      });

      const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());
      chartRef.current = chart;
      candleSeriesRef.current = series;
      isChartReadyRef.current = true;
    } catch (e) {
      console.error("Chart init failed:", e);
      setChartError("Failed to initialize chart");
      return;
    }

    let frameId: number;

    const observer = new ResizeObserver((entries) => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        if (chartRef.current) {
          chartRef.current.applyOptions({
            width: entries[0].contentRect.width,
          });
        }
      });
    });

    observer.observe(container);

    return () => {
      isChartReadyRef.current = false;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [height]);

  /* Sync data */
  useEffect(() => {
    if (!isChartReadyRef.current || !candleSeriesRef.current) return;
    if (convertedData.length === 0) return;

    try {
      candleSeriesRef.current.setData(convertedData);

      const dataChanged = prevDataLengthRef.current !== convertedData.length;
      if (dataChanged) {
        chartRef.current?.timeScale().fitContent();
        prevDataLengthRef.current = convertedData.length;
      }
    } catch (e) {
      console.error("Failed to set chart data:", e);
    }
  }, [convertedData]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">{children}</div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">Period</span>

          <div className="border-border flex overflow-hidden rounded-lg border">
            {PERIOD_BUTTONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handlePeriodChange(value)}
                disabled={isPending}
                aria-pressed={period === value}
                className={`px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
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
      </div>

      {isPending && (
        <p className="text-muted-foreground text-xs" role="status" aria-live="polite">
          Loading chart data…
        </p>
      )}

      {chartError && !isPending && (
        <p className="text-destructive text-xs" role="alert">
          {chartError}
        </p>
      )}

      <div
        ref={chartContainerRef}
        className="border-border bg-card w-full rounded-xl border"
        style={{ height }}
        aria-label="Candlestick price chart"
        role="img"
      />
    </div>
  );
};

export default CandlestickChart;
