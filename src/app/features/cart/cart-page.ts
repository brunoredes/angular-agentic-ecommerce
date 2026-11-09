import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-page',
  imports: [CurrencyPipe, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <h1>Your cart</h1>
    @if (cart.items().length) {
      <ul>
        @for (item of cart.items(); track item.product.id) {
          <li>
            <a [routerLink]="['/products', item.product.id]">{{ item.product.name }}</a>
            <span>{{ item.quantity }} × {{ item.product.price | currency: 'USD' }}</span>
            <strong>{{ item.subtotal | currency: 'USD' }}</strong>
            <button mat-icon-button [attr.aria-label]="'Remove ' + item.product.name" (click)="cart.remove(item.product.id)">
              <mat-icon aria-hidden="true">delete</mat-icon>
            </button>
          </li>
        }
      </ul>
      <p class="total" role="status">Total: {{ cart.total() | currency: 'USD' }}</p>
      <a mat-flat-button routerLink="/checkout" class="checkout">Checkout</a>
    } @else {
      <p>Your cart is empty. <a routerLink="/products">Browse the catalog</a>.</p>
    }
  `,
  styles: `
    ul { list-style: none; padding: 0; }
    li { display: grid; grid-template-columns: 1fr auto auto auto; gap: 16px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .total { font-size: 1.25rem; font-weight: 500; text-align: right; }
    .checkout { display: block; width: fit-content; margin-left: auto; }
  `,
})
export class CartPage {
  protected readonly cart = inject(CartService);
}
