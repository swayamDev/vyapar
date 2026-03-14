import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTableProps } from "@/types";
import { cn } from "@/lib/utils";

const DataTable = <T,>({
  columns,
  data,
  rowKey,
  tableClassName,
  headerClassName,
  headerRowClassName,
  headerCellClassName,
  bodyRowClassName,
  bodyCellClassName,
}: DataTableProps<T>) => {
  return (
    <div className="w-full overflow-x-auto">
      <Table className={cn("w-full text-sm", tableClassName)}>
        <TableHeader
          className={cn("bg-card sticky top-0 z-10", headerClassName)}
        >
          <TableRow
            className={cn(
              "border-border border-b hover:bg-transparent",
              headerRowClassName,
            )}
          >
            {columns.map((column, i) => (
              <TableHead
                key={i}
                className={cn(
                  "text-muted-foreground py-3 text-xs font-medium first:pl-4 last:pr-4",
                  headerCellClassName,
                  column.headClassName,
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-muted-foreground py-6 text-center"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow
                key={rowKey(row, rowIndex)}
                className={cn(
                  "border-border hover:bg-muted/40 border-b transition-colors",
                  bodyRowClassName,
                )}
              >
                {columns.map((column, columnIndex) => (
                  <TableCell
                    key={columnIndex}
                    className={cn(
                      "py-3 first:pl-4 last:pr-4",
                      bodyCellClassName,
                      column.cellClassName,
                    )}
                  >
                    {column.cell(row, rowIndex)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
