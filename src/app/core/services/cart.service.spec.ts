import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { product, provideTestHttp, respond } from '../../../testing/http';
import { Cart } from '../models/product';
import { CartService } from './cart.service';

// Stock and quantity rules are enforced and tested in the Go backend; this covers the client state.
describe('CartService', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: provideTestHttp() }));
  const cart = () => TestBed.inject(CartService);
  const iphone = product('iphone-17', { price: 899 });
  const withIphones: Cart = { items: [{ product: iphone, quantity: 3, subtotal: 2697 }], count: 3, total: 2697 };

  it('adds through the API and takes the returned cart as state', async () => {
    const result = cart().add('iphone-17', 3);
    const req = await respond('POST', '/api/cart/items', withIphones);
    expect(req.request.body).toEqual({ productId: 'iphone-17', quantity: 3 });
    expect(await result).toEqual({ ok: true });
    expect(cart().count()).toBe(3);
    expect(cart().total()).toBe(2697);
  });

  it('rejects bad quantities without calling the API', async () => {
    expect((await cart().add('iphone-17', 0)).ok).toBe(false);
    expect((await cart().add('iphone-17', 1.5)).ok).toBe(false);
    TestBed.inject(HttpTestingController).expectNone('/api/cart/items');
  });

  it('surfaces the API error message', async () => {
    const result = cart().add('galaxy-s26', 1);
    const msg = 'Only 0 of "Galaxy S26" in stock (0 already in cart).';
    await respond('POST', '/api/cart/items', { error: msg }, { status: 409, statusText: 'Conflict' });
    expect(await result).toEqual({ ok: false, error: msg });
  });

  it('empties the cart after a successful checkout', async () => {
    const added = cart().add('iphone-17', 3);
    await respond('POST', '/api/cart/items', withIphones);
    await added;
    const result = cart().checkout('a@b.co');
    const req = await respond('POST', '/api/checkout', { id: 'o1', email: 'a@b.co', status: 'placed', total: 2697, createdAt: '', items: [] });
    expect(req.request.body).toEqual({ email: 'a@b.co' });
    expect((await result).ok).toBe(true);
    expect(cart().count()).toBe(0);
  });
});
