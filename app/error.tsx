"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-5xl">⚠️</div>
      <div className="space-y-2">
        <h2 className="text-foreground text-xl font-bold">
          Something went wrong
        </h2>
        <p className="text-muted-foreground text-sm">
          An unexpected error occurred. Please try again.
        </p>
      </div>
      <button
        onClick={reset}
        className="bg-primary text-primary-foreground rounded-xl px-6 py-2.5 text-sm font-medium transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
