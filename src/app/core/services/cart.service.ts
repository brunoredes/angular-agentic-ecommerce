import { afterNextRender, computed, inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { Cart, Order } from '../models/product';
import { apiErrorMessage } from './api-error';

export type CartResult = { ok: true } | { ok: false; error: string };

const EMPTY: Cart = { items: [], count: 0, total: 0 };

/** The session cart lives on the server (sid cookie); this holds the latest copy the API returned. */
@Service()
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly cart = signal<Cart>(EMPTY);

  readonly items = computed(() => this.cart().items);
  readonly count = computed(() => this.cart().count);
  readonly total = computed(() => this.cart().total);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    // Load after hydration so the server-rendered (empty) cart matches the first client render.
    afterNextRender(() => void this.refresh());
  }

  async refresh(): Promise<void> {
    try {
      this.cart.set(await firstValueFrom(this.http.get<Cart>('/api/cart')));
    } catch {
      // API unreachable: keep showing the last known cart.
    }
  }

  async add(productId: string, quantity: number): Promise<CartResult> {
    if (!Number.isInteger(quantity) || quantity < 1) return { ok: false, error: 'Quantity must be a whole number of at least 1.' };
    return this.send(this.http.post<Cart>('/api/cart/items', { productId, quantity }));
  }

  remove(productId: string): Promise<CartResult> {
    return this.send(this.http.delete<Cart>(`/api/cart/items/${encodeURIComponent(productId)}`));
  }

  /** Places an order for the whole cart; the server empties the cart in the same transaction. */
  async checkout(email: string): Promise<{ ok: true; order: Order } | { ok: false; error: string }> {
    try {
      const order = await firstValueFrom(this.http.post<Order>('/api/checkout', { email }));
      this.cart.set(EMPTY);
      return { ok: true, order };
    } catch (e) {
      void this.refresh(); // stock may have changed; show the server's view of the cart
      return { ok: false, error: apiErrorMessage(e) };
    }
  }

  private async send(request: Observable<Cart>): Promise<CartResult> {
    try {
      this.cart.set(await firstValueFrom(request));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: apiErrorMessage(e) };
    }
  }
}
