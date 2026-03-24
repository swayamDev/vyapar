"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { buildPageNumbers, cn, ELLIPSIS } from "@/lib/utils";
import type { Pagination } from "@/types";

const CoinsPagination = ({
  currentPage,
  totalPages,
  hasMorePages,
}: Pagination) => {
  const router = useRouter();

  const handlePageChange = useCallback(
    (page: number) => {
      router.push(`/coins?page=${page}`);
    },
    [router],
  );

  const pageNumbers = buildPageNumbers(currentPage, totalPages);
  const isLastPage = !hasMorePages || currentPage >= totalPages;

  return (
    <UIPagination aria-label="Coins pagination">
      <PaginationContent className="gap-1 sm:gap-2">
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={currentPage === 1}
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            className={cn(
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer",
            )}
          />
        </PaginationItem>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => (
          <PaginationItem
            key={page === ELLIPSIS ? `ellipsis-${index}` : page}
          >
            {page === ELLIPSIS ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => handlePageChange(page as number)}
                aria-current={currentPage === page ? "page" : undefined}
                className={cn(
                  "h-9 w-9 cursor-pointer",
                  currentPage === page &&
                    "bg-primary text-primary-foreground pointer-events-none",
                )}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            aria-disabled={isLastPage}
            onClick={() => !isLastPage && handlePageChange(currentPage + 1)}
            className={cn(
              isLastPage ? "pointer-events-none opacity-50" : "cursor-pointer",
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </UIPagination>
  );
};

export default CoinsPagination;
