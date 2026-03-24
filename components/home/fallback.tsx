import DataTable from "@/components/tables/DataTable";

/* =====================
   Shared skeleton primitives
===================== */

const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse rounded bg-muted/60 ${className ?? ""}`}
    aria-hidden="true"
  />
);

/* =====================
   CoinOverview Fallback
===================== */

export const CoinOverviewFallback = () => (
  <div aria-busy="true" aria-label="Loading market overview">
    {/* Header row */}
    <div className="mb-4 flex items-center gap-4 pb-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-6 w-40" />
      </div>
    </div>
    {/* Chart skeleton */}
    <Skeleton className="h-[360px] w-full rounded-xl" />
  </div>
);

/* =====================
   TrendingCoins Fallback
===================== */

type SkeletonRow = { id: number };

const trendingSkeletonColumns = [
  {
    header: "Coin",
    cell: () => (
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    ),
  },
  {
    header: "24h",
    cell: () => <Skeleton className="h-3 w-12" />,
  },
  {
    header: "Price",
    cell: () => <Skeleton className="h-3 w-16" />,
  },
];

const trendingDummyData: SkeletonRow[] = Array.from({ length: 6 }, (_, i) => ({
  id: i,
}));

export const TrendingCoinsFallback = () => (
  <div aria-busy="true" aria-label="Loading trending coins">
    <DataTable
      data={trendingDummyData}
      columns={trendingSkeletonColumns as Parameters<typeof DataTable>[0]["columns"]}
      rowKey={(item) => item.id}
      tableClassName="w-full"
      headerCellClassName="text-xs font-medium text-muted-foreground py-3"
      bodyCellClassName="py-3"
    />
  </div>
);

/* =====================
   Categories Fallback
===================== */

const categoriesSkeletonColumns = [
  {
    header: "Category",
    cell: () => <Skeleton className="h-3 w-32" />,
  },
  {
    header: "Top Coins",
    cell: () => (
      <div className="flex gap-1">
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>
    ),
  },
  {
    header: "24h",
    cell: () => <Skeleton className="h-3 w-12" />,
  },
  {
    header: "Market Cap",
    cell: () => <Skeleton className="h-3 w-20" />,
  },
  {
    header: "Volume (24h)",
    cell: () => <Skeleton className="h-3 w-16" />,
  },
];

const categoriesDummyData: SkeletonRow[] = Array.from(
  { length: 10 },
  (_, i) => ({ id: i }),
);

export const CategoriesFallback = () => (
  <div aria-busy="true" aria-label="Loading categories">
    <DataTable
      data={categoriesDummyData}
      columns={categoriesSkeletonColumns as Parameters<typeof DataTable>[0]["columns"]}
      rowKey={(item) => item.id}
      tableClassName="w-full"
      headerCellClassName="text-xs font-medium text-muted-foreground py-3"
      bodyCellClassName="py-3"
    />
  </div>
);
