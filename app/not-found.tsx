import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-5xl">🔍</div>
      <div className="space-y-2">
        <h1 className="text-foreground text-2xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground text-sm">
          The coin or page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <Link
        href="/"
        className="bg-primary text-primary-foreground rounded-xl px-6 py-2.5 text-sm font-medium transition hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}
