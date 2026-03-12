"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../ui/theme-toggle";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const Header = () => {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-border bg-background w-full border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            {mounted && (
              <Image
                src={
                  resolvedTheme === "dark"
                    ? "/logo-dark.webp"
                    : "/logo-light.webp"
                }
                alt="CoinPulse logo"
                width={132}
                height={40}
              />
            )}
          </Link>

          <nav className="flex items-center gap-6">
            <p className="text-muted-foreground text-sm">Search Modal</p>

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
        </div>
      </div>
    </header>
  );
};

export default Header;
