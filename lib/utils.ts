import { clsx, type ClassValue } from "clsx";
import { Time } from "lightweight-charts";
import { twMerge } from "tailwind-merge";

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
) {
  if (value == null || Number.isNaN(value)) {
    return showSymbol ? "$0.00" : "0.00";
  }

  return value.toLocaleString(undefined, {
    style: showSymbol ? "currency" : "decimal",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
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
  const diff = now - past;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} min`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""}`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""}`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""}`;

  return new Date(past).toISOString().split("T")[0];
}

/* Convert CoinGecko OHLC → Lightweight Charts */
export function convertOHLCData(data: OHLCData[]) {
  const seen = new Set();

  return data
    .map((d) => ({
      time: d[0] as Time,
      open: d[1],
      high: d[2],
      low: d[3],
      close: d[4],
    }))
    .filter((item) => {
      if (seen.has(item.time)) return false;
      seen.add(item.time);
      return true;
    });
}

/* Pagination helper */
export const ELLIPSIS = "ellipsis" as const;

export function buildPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | typeof ELLIPSIS)[] {
  const MAX_VISIBLE_PAGES = 5;
  const pages: (number | typeof ELLIPSIS)[] = [];

  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

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
