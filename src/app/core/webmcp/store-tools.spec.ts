import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { product, provideTestHttp, respond } from '../../../testing/http';
import { STORE_TOOLS } from './store-tools';

function call(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
  const tool = STORE_TOOLS.find((t) => t.name === name)!;
  return runInInjectionContext(TestBed.inject(EnvironmentInjector), async () => JSON.parse((await tool.execute(args as never, {} as never)) as string));
}

describe('STORE_TOOLS', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: provideTestHttp() }));

  it('search_products returns a JSON summary and validates category', async () => {
    const found = call('search_products', { query: 'pixel' });
    await respond('GET', '/api/products', [product('pixel-10-pro', { name: 'Pixel 10 Pro', brand: 'Google', category: 'phone', price: 999, stock: 12 })]);
    expect(await found).toEqual([{ id: 'pixel-10-pro', name: 'Pixel 10 Pro', brand: 'Google', category: 'phone', price: 999, stock: 12 }]);
    expect(await call('search_products', { category: 'toaster' })).toHaveProperty('error');
    TestBed.inject(HttpTestingController).verify(); // the bad category never reached the API
  });

  it('compare_products requires 2-4 ids', async () => {
    expect(await call('compare_products', { ids: ['iphone-17'] })).toHaveProperty('error');
    const result = call('compare_products', { ids: ['iphone-17', 'pixel-10-pro'] });
    await respond('GET', '/api/products', [product('iphone-17'), product('pixel-10-pro')]);
    expect(((await result) as { rows: unknown[] }).rows.length).toBe(2); // price + stock
  });

  it('add_to_cart defaults quantity to 1 and passes errors through', async () => {
    const added = call('add_to_cart', { id: 'rtx-5080', quantity: '2' }); // non-number → default 1
    const req = await respond('POST', '/api/cart/items', { items: [], count: 1, total: 999 });
    expect(req.request.body).toEqual({ productId: 'rtx-5080', quantity: 1 });
    expect(await added).toEqual({ ok: true, cartCount: 1, cartTotal: 999 });

    const failed = call('add_to_cart', { id: 'rtx-5080', quantity: 99 });
    await respond('POST', '/api/cart/items', { error: 'Only 3 in stock.' }, { status: 409, statusText: 'Conflict' });
    expect(await failed).toEqual({ error: 'Only 3 in stock.' });
  });

  it('view_cart reads the server cart', async () => {
    const viewed = call('view_cart');
    await respond('GET', '/api/cart', { items: [{ product: product('rtx-5080', { name: 'GeForce RTX 5080' }), quantity: 1, subtotal: 999 }], count: 1, total: 999 });
    expect(await viewed).toEqual({ items: [{ id: 'rtx-5080', name: 'GeForce RTX 5080', quantity: 1, subtotal: 999 }], total: 999 });
  });
});
