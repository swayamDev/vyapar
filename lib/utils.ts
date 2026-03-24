import { clsx, type ClassValue } from "clsx";
import { Time } from "lightweight-charts";
import { twMerge } from "tailwind-merge";
import { OHLCData } from "@/types";

/* Tailwind class merge helper */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

/* Currency Formatter */
export function formatCurrency(
  value: number | null | undefined,
  digits = 2,
  currency = "USD",
  showSymbol = true,
): string {
  if (value == null || Number.isNaN(value)) {
    return showSymbol ? "$0.00" : "0.00";
  }

  // For very small prices (e.g. meme coins), use more decimal places
  const effectiveDigits =
    digits === 2 && value > 0 && value < 0.01
      ? Math.min(8, Math.max(2, -Math.floor(Math.log10(value)) + 2))
      : digits;

  return value.toLocaleString(undefined, {
    style: showSymbol ? "currency" : "decimal",
    currency: currency.toUpperCase(),
    minimumFractionDigits: showSymbol ? 2 : effectiveDigits,
    maximumFractionDigits: effectiveDigits,
  });
}

/* Percentage Formatter */
export function formatPercentage(change?: number | null): string {
  if (change == null || Number.isNaN(change)) return "0.0%";
  return `${change.toFixed(1)}%`;
}

/* Trending UI classes */
export function trendingClasses(value: number) {
  const isUp = value > 0;
  return {
    textClass: isUp ? "text-green-400" : "text-red-400",
    bgClass: isUp ? "bg-green-500/10" : "bg-red-500/10",
    iconClass: isUp ? "icon-up" : "icon-down",
  };
}

/* Relative time formatter */
export function timeAgo(date: string | number | Date): string {
  const now = Date.now();
  const past = new Date(date).getTime();

  if (Number.isNaN(past)) return "—";

  const diff = now - past;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;

  return new Date(past).toISOString().split("T")[0];
}

/* Convert CoinGecko OHLC → Lightweight Charts
 * CoinGecko returns [timestamp_ms, open, high, low, close]
 * lightweight-charts expects { time: UTCTimestamp (seconds), open, high, low, close }
 */
export function convertOHLCData(data: OHLCData[]) {
  const seen = new Set<number>();

  return data
    .map((d) => ({
      time: Math.floor(d[0] / 1000) as Time,
      open: d[1],
      high: d[2],
      low: d[3],
      close: d[4],
    }))
    .filter((item) => {
      const t = item.time as number;
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    })
    .sort((a, b) => (a.time as number) - (b.time as number));
}

/* Pagination helper */
export const ELLIPSIS = "ellipsis" as const;

export function buildPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | typeof ELLIPSIS)[] {
  const MAX_VISIBLE = 5;

  if (totalPages <= MAX_VISIBLE) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | typeof ELLIPSIS)[] = [];
  pages.push(1);

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push(ELLIPSIS);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) pages.push(ELLIPSIS);

  pages.push(totalPages);

  return pages;
}
