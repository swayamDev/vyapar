"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

import { useCommandPalette } from "@/lib/command-palette-store";

interface CoinResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number | null;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "All Coins", href: "/coins" },
];

export function CommandPalette() {
  const { open, setOpen, toggle } = useCommandPalette();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CoinResult[]>([]);
  const [isSearching, startSearchTransition] = useTransition();

  const debouncedQuery = useDebounce(query, 300);

  /* ⌘K / Ctrl+K shortcut */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  /* Clear state on close */
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  /* Search */
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      setResults([]);
      return;
    }

    startSearchTransition(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const data: { coins: CoinResult[] } = await res.json();
        setResults(data.coins?.slice(0, 8) ?? []);
      } catch {
        // silently fail — search is non-critical
      }
    });
  }, [debouncedQuery]);

  /* Navigate to a coin detail page */
  const handleCoinSelect = useCallback(
    (coinId: string) => {
      setOpen(false);
      router.push(`/coins/${coinId}`);
    },
    [router, setOpen],
  );

  /* Navigate to an app route (home, /coins, etc.) */
  const handleNavSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router, setOpen],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-background z-[100] w-full max-w-xl rounded-xl border p-0 shadow-lg">
        <DialogTitle className="sr-only">Search coins</DialogTitle>
        <DialogDescription className="sr-only">
          Type a coin name or symbol to search
        </DialogDescription>

        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search coins…"
            value={query}
            onValueChange={setQuery}
          />

          <CommandList>
            {isSearching && (
              <p className="text-muted-foreground py-4 text-center text-sm">
                Searching…
              </p>
            )}

            {!isSearching && debouncedQuery && results.length === 0 && (
              <CommandEmpty>
                No coins found for &quot;{debouncedQuery}&quot;
              </CommandEmpty>
            )}

            {results.length > 0 && (
              <CommandGroup heading="Coins">
                {results.map((coin) => (
                  <CommandItem
                    key={coin.id}
                    value={coin.id}
                    onSelect={() => handleCoinSelect(coin.id)}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    {coin.thumb && (
                      <Image
                        src={coin.thumb}
                        alt={coin.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    )}
                    <span className="font-medium">{coin.name}</span>
                    <span className="text-muted-foreground text-xs uppercase">
                      {coin.symbol}
                    </span>
                    {coin.market_cap_rank && (
                      <span className="text-muted-foreground ml-auto text-xs">
                        #{coin.market_cap_rank}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!debouncedQuery && (
              <CommandGroup heading="Navigation">
                {NAV_ITEMS.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={item.href}
                    onSelect={() => handleNavSelect(item.href)}
                    className="cursor-pointer"
                  >
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
