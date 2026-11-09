import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTestHttp, respond } from '../../../testing/http';
import { DATA_TOOLS } from './data-tools';

function call(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
  const tool = DATA_TOOLS.find((t) => t.name === name)!;
  return runInInjectionContext(TestBed.inject(EnvironmentInjector), async () => JSON.parse((await tool.execute(args as never, {} as never)) as string));
}

const page = (rows: unknown[], total: number, limit: number, offset: number) => ({ columns: ['product_id'], rows, total, limit, offset });

// Query validation and execution are tested in the Go backend (internal/shop/tables_test.go).
describe('DATA_TOOLS', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: provideTestHttp() }));

  it('preview_query forces 5 rows from offset 0 and reports validity', async () => {
    const preview = call('preview_query', { table: 'product_specs', limit: 50, offset: 9 });
    const req = await respond('POST', '/api/query', page([{ product_id: 'a' }], 63, 5, 0));
    expect(req.request.body).toMatchObject({ table: 'product_specs', limit: 5, offset: 0 });
    expect(await preview).toEqual({ valid: true, columns: ['product_id'], sampleRows: [{ product_id: 'a' }], totalRows: 63 });

    const invalid = call('preview_query', { table: 'nope' });
    await respond('POST', '/api/query', { error: 'table must be one of: …' }, { status: 400, statusText: 'Bad Request' });
    expect(await invalid).toEqual({ valid: false, error: 'table must be one of: …' });
  });

  it('get_query_results adds hasMore', async () => {
    const first = call('get_query_results', { table: 'inventory', limit: 10 });
    await respond('POST', '/api/query', page(Array(10).fill({ product_id: 'x' }), 14, 10, 0));
    expect(await first).toMatchObject({ total: 14, hasMore: true });
    const last = call('get_query_results', { table: 'inventory', limit: 10, offset: 10 });
    await respond('POST', '/api/query', page(Array(4).fill({ product_id: 'x' }), 14, 10, 10));
    expect(await last).toMatchObject({ hasMore: false });
  });

  it('describe_table rejects unknown tables without calling the API', async () => {
    expect(await call('describe_table', { table: 'x' })).toHaveProperty('error');
    const described = call('describe_table', { table: 'inventory' });
    await respond('GET', '/api/tables/inventory', { name: 'inventory', description: '', columns: [] });
    expect(await described).toMatchObject({ name: 'inventory' });
  });
});
