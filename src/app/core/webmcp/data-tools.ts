import { injectAsync, WebMcpToolDescriptor } from '@angular/core';
import { QUERY_OPS, TABLE_NAMES } from '../models/data-query';

type Args = Record<string, unknown>;
const json = (v: unknown) => JSON.stringify(v);
const PREVIEW_ROWS = 5;

// Async DI: the table/query engine is only needed when an agent explores data, so it is its own lazy chunk.
const tables = () => injectAsync(() => import('../services/data-tables.service').then((m) => m.DataTablesService))();

const querySchema = (paged: boolean) => ({
  type: 'object',
  properties: {
    table: { type: 'string', enum: TABLE_NAMES },
    columns: { type: 'array', items: { type: 'string' }, description: 'Columns to return. Defaults to all.' },
    where: {
      type: 'array',
      description: 'Filters, combined with AND.',
      items: {
        type: 'object',
        properties: {
          column: { type: 'string' },
          op: { type: 'string', enum: QUERY_OPS },
          value: { description: 'Must match the column type; an array for "in".' },
        },
        required: ['column', 'op', 'value'],
      },
    },
    orderBy: {
      type: 'object',
      properties: { column: { type: 'string' }, direction: { type: 'string', enum: ['asc', 'desc'] } },
      required: ['column'],
    },
    ...(paged && {
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      offset: { type: 'integer', minimum: 0, default: 0 },
    }),
  },
  required: ['table'],
});

export const DATA_TOOLS: WebMcpToolDescriptor[] = [
  {
    name: 'list_tables',
    title: 'List tables',
    description: 'List the read-only data tables of the store (catalog, specs, inventory, cart) with row counts.',
    annotations: { readOnlyHint: true },
    execute: async () => json(await (await tables()).listTables()),
  },
  {
    name: 'describe_table',
    title: 'Describe table',
    description: 'Describe the columns of a table: name, type, primary key and foreign key references.',
    inputSchema: { type: 'object', properties: { table: { type: 'string', enum: TABLE_NAMES } }, required: ['table'] },
    annotations: { readOnlyHint: true },
    execute: async (args: Args) =>
      json((await (await tables()).describe(args['table'])) ?? { error: `table must be one of: ${TABLE_NAMES.join(', ')}.` }),
  },
  {
    name: 'get_table_relationships',
    title: 'Get table relationships',
    description: 'List foreign-key relationships between tables. Queries cannot join, so use these to run follow-up queries.',
    annotations: { readOnlyHint: true },
    execute: async () => json(await (await tables()).relationships()),
  },
  {
    name: 'preview_query',
    title: 'Preview query',
    description: `Validate a query and return the first ${PREVIEW_ROWS} matching rows plus the total match count. Use before get_query_results.`,
    inputSchema: querySchema(false),
    annotations: { readOnlyHint: true },
    execute: async (args: Args) => {
      const result = await (await tables()).query({ ...args, limit: PREVIEW_ROWS, offset: 0 });
      return json(
        'error' in result
          ? { valid: false, error: result.error }
          : { valid: true, columns: result.columns, sampleRows: result.rows, totalRows: result.total },
      );
    },
  },
  {
    name: 'get_query_results',
    title: 'Get query results',
    description: 'Run a query and return one page of rows (limit up to 100). Use offset to page; hasMore tells if more rows exist.',
    inputSchema: querySchema(true),
    annotations: { readOnlyHint: true },
    execute: async (args: Args) => {
      const result = await (await tables()).query(args);
      return json('error' in result ? result : { ...result, hasMore: result.offset + result.rows.length < result.total });
    },
  },
];
