type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export default function ErrorState({
  title = "Something went wrong",
  description = "Please try again later.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="border-border bg-card flex flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center">
      <div className="text-2xl">⚠️</div>

      <h3 className="text-foreground text-sm font-semibold">{title}</h3>

      <p className="text-muted-foreground text-xs">{description}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-primary text-primary-foreground mt-2 rounded-lg px-4 py-2 text-xs font-medium transition hover:opacity-90"
        >
          Retry
        </button>
      )}
    </div>
  );
}
