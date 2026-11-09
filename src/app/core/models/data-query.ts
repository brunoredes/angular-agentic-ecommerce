// Kept apart from DataTablesService so the tool schemas can use these names without pulling the service into the main bundle.
export const TABLE_NAMES = ['products', 'product_specs', 'inventory', 'cart_items'] as const;
export type TableName = (typeof TABLE_NAMES)[number];

export const QUERY_OPS = ['=', '!=', '<', '<=', '>', '>=', 'contains', 'in'] as const;
export type QueryOp = (typeof QUERY_OPS)[number];

export type Cell = string | number | boolean;
export type Row = Record<string, Cell>;

export interface ColumnDef {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  primaryKey?: true;
  references?: string; // "table.column"
}

export interface DataQuery {
  table: TableName;
  columns?: string[];
  where?: { column: string; op: QueryOp; value: Cell | Cell[] }[];
  orderBy?: { column: string; direction?: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
}

export type QueryResult = { columns: string[]; rows: Row[]; total: number; limit: number; offset: number } | { error: string };
