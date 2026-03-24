import { fetcher } from "@/lib/coingecko-client";
import DataTable from "@/components/tables/DataTable";
import Image from "next/image";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { CategoriesFallback } from "./fallback";
import { Category, DataTableColumn } from "@/types";

const Categories = async () => {
  let categories: Category[] = [];

  try {
    categories = await fetcher<Category[]>("/coins/categories", undefined, 300);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return <CategoriesFallback />;
  }

  if (!categories?.length) {
    return <CategoriesFallback />;
  }

  const columns: DataTableColumn<Category>[] = [
    {
      header: "Category",
      cell: (category) => (
        <span className="text-foreground text-sm font-medium">
          {category.name}
        </span>
      ),
    },
    {
      header: "Top Coins",
      cell: (category) => {
        const validCoins = category.top_3_coins.filter(Boolean);
        return (
          <div className="flex items-center -space-x-2">
            {validCoins.map((coinUrl, i) => (
              <Image
                key={`${category.id}-coin-${i}`}
                src={coinUrl}
                alt={`Top coin ${i + 1}`}
                width={28}
                height={28}
                className="border-background rounded-full border-2"
              />
            ))}
          </div>
        );
      },
    },
    {
      header: "24h",
      cell: (category) => {
        const change = category.market_cap_change_24h ?? 0;
        const isUp = change > 0;
        return (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isUp ? "text-green-500" : "text-red-500",
            )}
          >
            {isUp ? "+" : ""}
            {formatPercentage(change)}
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          </div>
        );
      },
    },
    {
      header: "Market Cap",
      cell: (category) => (
        <span className="tabular-nums text-sm font-medium">
          {formatCurrency(category.market_cap)}
        </span>
      ),
    },
    {
      header: "Volume (24h)",
      cell: (category) => (
        <span className="text-muted-foreground tabular-nums text-sm">
          {formatCurrency(category.volume_24h)}
        </span>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={categories.slice(0, 10)}
        rowKey={(category) => category.id}
        tableClassName="w-full"
        headerCellClassName="text-xs text-muted-foreground font-medium py-3"
        bodyCellClassName="py-3"
      />
    </div>
  );
};

export default Categories;
