import { ButtonSize } from "./ui";

export interface Pagination {
  currentPage: number;
  totalPages: number;
  hasMorePages: boolean;
}

export type PaginationLinkProps = {
  isActive?: boolean;
  size?: ButtonSize;
} & React.ComponentProps<"a">;
