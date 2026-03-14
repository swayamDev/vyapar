import { fetcher } from "@/lib/coingecko-client";
import DataTable from "@/components/tables/DataTable";
import Image from "next/image";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { CategoriesFallback } from "./fallback";

const Categories = async () => {
  try {
    const categories = await fetcher<Category[]>("/coins/categories");

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
        cell: (category) => (
          <div className="flex items-center -space-x-2">
            {category.top_3_coins.map((coin, i) => (
              <Image
                key={coin}
                src={coin}
                alt={`coin-${i}`}
                width={28}
                height={28}
                className="border-background rounded-full border"
              />
            ))}
          </div>
        ),
      },

      {
        header: "24h",
        cell: (category) => {
          const change = category.market_cap_change_24h;
          const isUp = change > 0;

          return (
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                isUp ? "text-green-500" : "text-red-500",
              )}
            >
              {formatPercentage(change)}

              {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
          );
        },
      },

      {
        header: "Market Cap",
        cell: (category) => (
          <span className="text-sm font-medium">
            {formatCurrency(category.market_cap)}
          </span>
        ),
      },

      {
        header: "Volume (24h)",
        cell: (category) => (
          <span className="text-muted-foreground text-sm">
            {formatCurrency(category.volume_24h)}
          </span>
        ),
      },
    ];

    return (
      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={categories?.slice(0, 10) ?? []}
          rowKey={(category) => category.id}
          tableClassName="w-full"
          headerCellClassName="text-xs text-muted-foreground font-medium py-3"
          bodyCellClassName="py-3"
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return <CategoriesFallback />;
  }
};

export default Categories;
