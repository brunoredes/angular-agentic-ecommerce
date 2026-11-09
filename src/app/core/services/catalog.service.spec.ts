import { TestBed } from '@angular/core/testing';
import { product, provideTestHttp, respond } from '../../../testing/http';
import { CatalogService } from './catalog.service';
import { CompareService } from './compare.service';

// Filtering itself is tested in the Go backend (internal/shop/api_test.go).
describe('CatalogService', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: provideTestHttp() }));
  const catalog = () => TestBed.inject(CatalogService);

  it('sends only the filters that are set', async () => {
    const result = catalog().search({ query: '  ryzen ', category: 'cpu', maxPrice: 600 });
    const req = await respond('GET', '/api/products', [product('ryzen-7-9800x3d')]);
    expect(req.request.params.keys()).toEqual(['query', 'category', 'maxPrice']);
    expect(req.request.params.get('query')).toBe('ryzen');
    expect((await result).map((p) => p.id)).toEqual(['ryzen-7-9800x3d']);
  });

  it('maps 404 to undefined and reports inventory', async () => {
    const missing = catalog().getById('nope');
    await respond('GET', '/api/products/nope', { error: 'Unknown product "nope".' }, { status: 404, statusText: 'Not Found' });
    expect(await missing).toBeUndefined();

    const stock = catalog().inventory('galaxy-s26');
    await respond('GET', '/api/products/galaxy-s26', product('galaxy-s26', { stock: 0 }));
    expect(await stock).toEqual({ id: 'galaxy-s26', stock: 0, available: false });
  });

  it('rethrows non-404 failures', async () => {
    const failing = catalog().getById('x');
    await respond('GET', '/api/products/x', null, { status: 500, statusText: 'Error' });
    await expect(failing).rejects.toBeTruthy();
  });
});

describe('CompareService', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: provideTestHttp() }));

  it('keeps the requested order, flags differing rows and reports unknown ids', async () => {
    const pending = TestBed.inject(CompareService).compare(['rx-9070-xt', 'rtx-5080', 'nope', 'rtx-5080']);
    const req = await respond('GET', '/api/products', [
      product('rtx-5080', { price: 999, specs: { 'VRAM (GB)': 16 } }),
      product('rx-9070-xt', { price: 599, specs: { 'VRAM (GB)': 16 } }),
    ]);
    expect(req.request.params.get('ids')).toBe('rx-9070-xt,rtx-5080,nope');
    const { products, rows, missing } = await pending;
    expect(products.map((p) => p.id)).toEqual(['rx-9070-xt', 'rtx-5080']);
    expect(missing).toEqual(['nope']);
    expect(rows.find((r) => r.key === 'VRAM (GB)')).toEqual({ key: 'VRAM (GB)', values: [16, 16], differs: false });
    expect(rows.find((r) => r.key === 'Price (USD)')?.differs).toBe(true);
  });
});
