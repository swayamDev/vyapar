"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../ui/theme-toggle";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MobileMenu } from "../ui/mobile-menu";
import { useCommandPalette } from "@/lib/command-palette-store";

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
      <div className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            {mounted && (
              <Image
                src={
                  resolvedTheme === "dark"
                    ? "/logo-dark.webp"
                    : "/logo-light.webp"
                }
                alt="Vyapar logo"
                width={120}
                height={34}
                priority
                className="h-8.5 w-auto"
              />
            )}
          </Link>

          {/* Desktop Search */}
          <div className="hidden max-w-md flex-1 md:block">
            <button
              onClick={toggle}
              className="border-border bg-muted/40 text-muted-foreground hover:bg-muted flex w-full items-center gap-3 rounded-xl border px-4 py-2 text-sm transition"
            >
              <span>Search coins...</span>

              <kbd className="ml-auto hidden items-center gap-1 text-xs md:flex">
                ⌘ K
              </kbd>
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/coins"
              className={cn(
                "hover:text-primary text-sm font-medium transition-colors",
                pathname === "/coins"
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              All Coins
            </Link>

            <ThemeToggle />
          </nav>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggle}
              className="border-border bg-muted/40 text-muted-foreground hover:bg-muted flex w-full items-center gap-3 rounded-xl border px-4 py-2 text-sm transition"
            >
              <span>Search coins...</span>

              <kbd className="ml-auto hidden items-center gap-1 text-xs md:flex">
                ⌘ K
              </kbd>
            </button>
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
