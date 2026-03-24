"use client";

import dynamic from "next/dynamic";
import type { CandlestickChartProps } from "@/types";

// lightweight-charts uses browser APIs (ResizeObserver, DOM) that are not
// available during SSR. Dynamic import with ssr:false prevents hydration errors
// and "window is not defined" crashes.
const CandlestickChart = dynamic(() => import("./CandlestickChart"), {
  ssr: false,
  loading: () => (
    <div
      className="border-border bg-muted/20 animate-pulse rounded-xl border"
      style={{ height: 360 }}
      aria-label="Loading chart…"
      aria-busy="true"
    />
  ),
});

export default function CandlestickChartClient(
  props: CandlestickChartProps,
) {
  return <CandlestickChart {...props} />;
}
