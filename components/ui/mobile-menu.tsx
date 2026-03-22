"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="hover:bg-muted rounded-xl p-2 transition"
      >
        <Menu size={20} />
      </button>

      <SheetContent side="right" className="z-100 w-72 p-6">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Navigation menu</SheetDescription>

        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold">Menu</h2>

          <nav className="flex flex-col gap-4">
            <Link
              href="/coins"
              onClick={() => setOpen(false)} // close on click
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === "/coins"
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              All Coins
            </Link>
          </nav>

          <div className="border-t pt-4">
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
