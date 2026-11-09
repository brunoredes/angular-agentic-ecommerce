import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Order } from '../../core/models/product';

@Component({
  selector: 'app-orders-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <h1>Your orders</h1>
    @if (orders.error()) {
      <p role="alert">Could not load your orders. Please try again.</p>
    } @else if (orders.hasValue()) {
      @for (o of orders.value(); track o.id) {
        <section [attr.aria-labelledby]="'order-' + o.id">
          <h2 [id]="'order-' + o.id">Order of {{ o.createdAt | date: 'medium' }}</h2>
          <p>Status: {{ o.status }} · Receipt to {{ o.email }}</p>
          <ul>
            @for (i of o.items; track i.productId) {
              <li>{{ i.quantity }} × {{ i.name }} at {{ i.unitPrice | currency: 'USD' }}</li>
            }
          </ul>
          <p class="total">Total: {{ o.total | currency: 'USD' }}</p>
        </section>
      } @empty {
        <p>No orders yet. <a routerLink="/products">Browse the catalog</a>.</p>
      }
    }
  `,
  styles: `
    section { padding: 8px 0; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    h2 { font-size: 1.1rem; }
    .total { font-weight: 500; }
  `,
})
export class OrdersPage {
  protected readonly orders = httpResource<Order[]>(() => '/api/orders');
}
