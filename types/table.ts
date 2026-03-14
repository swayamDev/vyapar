export interface DataTableColumn<T> {
  header: React.ReactNode;
  cell: (row: T, rowIndex: number) => React.ReactNode;
  headClassName?: string;
  cellClassName?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T, rowIndex: number) => string | number;

  tableClassName?: string;
  headerClassName?: string;
  headerRowClassName?: string;
  headerCellClassName?: string;
  bodyRowClassName?: string;
  bodyCellClassName?: string;
}
