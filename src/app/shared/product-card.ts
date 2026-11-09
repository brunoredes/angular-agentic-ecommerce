import { Component, computed, inject, input, model } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CATEGORY_META, Product } from '../core/models/product';
import { CartService } from '../core/services/cart.service';
import { StockLabel } from './stock-label';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, RouterLink, MatButtonModule, MatCheckboxModule, MatIconModule, StockLabel],
  template: `
    @let p = product();
    <div class="media">
      <mat-icon aria-hidden="true">{{ meta().icon }}</mat-icon>
      @if (badge(); as b) { <span class="badge" aria-hidden="true">{{ b }}</span> }
    </div>
    <div class="body">
      <h3><a [routerLink]="['/products', p.id]">{{ p.name }}</a></h3>
      <p class="brand">{{ p.brand }} · {{ meta().label }}</p>
      <p class="price">{{ p.price | currency: 'USD' }}</p>
      <app-stock-label class="stock" [stock]="p.stock" />
      <div class="actions">
        <button mat-stroked-button [disabled]="!p.stock" (click)="add()">
          <mat-icon aria-hidden="true">add_shopping_cart</mat-icon> Add<span class="cdk-visually-hidden"> {{ p.name }} to cart</span>
        </button>
        @if (comparable()) {
          <mat-checkbox [checked]="compared()" (change)="compared.set($event.checked)">
            Compare<span class="cdk-visually-hidden"> {{ p.name }}</span>
          </mat-checkbox>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex; flex-direction: column; height: 100%; overflow: hidden;
      border: 1px solid var(--mat-sys-outline-variant); border-radius: 16px; background: var(--mat-sys-surface);
      transition: border-color 150ms, box-shadow 150ms;
    }
    :host:hover, :host:focus-within { border-color: var(--mat-sys-primary); box-shadow: var(--mat-sys-level2); }
    .media { position: relative; display: grid; place-items: center; height: 150px; background: var(--mat-sys-surface-container); }
    .media mat-icon { font-size: 72px; width: 72px; height: 72px; color: var(--mat-sys-on-surface-variant); }
    .badge {
      position: absolute; top: 0; right: 0; padding: 6px 10px; border-radius: 0 16px 0 12px;
      background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); font: var(--mat-sys-label-small); text-transform: uppercase;
    }
    .body { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px 14px; flex: 1; }
    h3 { font: var(--mat-sys-title-small); margin: 0; }
    h3 a { color: inherit; text-decoration: none; }
    h3 a:hover { text-decoration: underline; }
    .brand { margin: 0; font: var(--mat-sys-body-small); color: var(--mat-sys-on-surface-variant); }
    .price { margin: 4px 0 0; font: var(--mat-sys-title-medium); font-weight: 600; }
    .stock { padding-top: 6px; margin-top: 2px; border-top: 1px solid var(--mat-sys-outline-variant); }
    .actions { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; margin-top: auto; padding-top: 8px; }
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
  /** Shows the "Compare" checkbox (catalog page). */
  readonly comparable = input(false);
  readonly compared = model(false);
  private readonly cart = inject(CartService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly meta = computed(() => CATEGORY_META[this.product().category]);
  /** Visual corner tag; the same info is in the stock label for screen readers. */
  protected readonly badge = computed(() => {
    const stock = this.product().stock;
    return stock === 0 ? 'Sold out' : stock < 5 ? `${stock} left` : undefined;
  });

  protected async add(): Promise<void> {
    const result = await this.cart.add(this.product().id, 1);
    this.snackBar.open(result.ok ? `${this.product().name} added to cart` : result.error, 'OK', { duration: 3000 });
  }
}
