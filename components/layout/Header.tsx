"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../ui/theme-toggle";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MobileMenu } from "../ui/mobile-menu";
import { useCommandPalette } from "@/lib/command-palette-store";

const NAV_LINKS = [{ label: "All Coins", href: "/coins" }];

const Header = () => {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { toggle } = useCommandPalette();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="Vyapar home"
          >
            {mounted ? (
              <Image
                src={
                  resolvedTheme === "dark"
                    ? "/logo-dark.webp"
                    : "/logo-light.webp"
                }
                alt="Vyapar"
                width={120}
                height={34}
                priority
                className="h-8 w-auto"
              />
            ) : (
              /* Prevent layout shift while mounting */
              <div className="h-8 w-[120px]" />
            )}
          </Link>

          {/* Desktop Search */}
          <button
            onClick={toggle}
            className="border-border bg-muted/40 text-muted-foreground hover:bg-muted hidden max-w-xs flex-1 items-center gap-3 rounded-xl border px-4 py-2 text-sm transition md:flex"
            aria-label="Search coins (⌘K)"
          >
            <Search size={14} className="shrink-0" />
            <span>Search coins…</span>
            <kbd className="ml-auto hidden items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-medium md:flex">
              ⌘K
            </kbd>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "hover:text-primary text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            <ThemeToggle />
          </nav>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggle}
              className="border-border bg-muted/40 text-muted-foreground hover:bg-muted rounded-xl border p-2 transition"
              aria-label="Search coins"
            >
              <Search size={16} />
            </button>
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
