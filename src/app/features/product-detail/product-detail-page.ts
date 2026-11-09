import { Component, computed, declareExperimentalWebMcpTool, inject, input, resource, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CatalogService } from '../../core/services/catalog.service';
import { CartService } from '../../core/services/cart.service';
import { SpecRow } from '../../core/services/compare.service';
import { SpecTable } from '../../shared/spec-table';
import { StockLabel } from '../../shared/stock-label';

@Component({
  selector: 'app-product-detail-page',
  imports: [CurrencyPipe, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, SpecTable, StockLabel],
  template: `
    <a mat-button routerLink="/products">← Back to catalog</a>
    @if (product(); as p) {
      <h1>{{ p.name }}</h1>
      <p>{{ p.brand }} · {{ p.description }}</p>
      <p class="price">{{ p.price | currency: 'USD' }}</p>
      <app-stock-label [stock]="p.stock" />
      <div class="buy">
        <mat-form-field appearance="outline">
          <mat-label>Quantity</mat-label>
          <input matInput type="number" min="1" [max]="p.stock" [value]="quantity()" (input)="quantity.set(+$any($event.target).value)" />
        </mat-form-field>
        <button mat-flat-button [disabled]="!p.stock" (click)="add(quantity())">Add to cart</button>
      </div>
      <h2>Specifications</h2>
      <app-spec-table [caption]="p.name + ' specifications'" [headers]="[p.name]" [rows]="specRows()" />
    } @else if (productRes.error()) {
      <h1>Could not load this product</h1>
      <p role="alert">Please try again.</p>
    } @else if (!productRes.isLoading()) {
      <h1>Product not found</h1>
    }
  `,
  styles: `
    .price { font-size: 1.5rem; font-weight: 500; }
    .buy { display: flex; gap: 16px; align-items: baseline; margin-top: 16px; }
    .buy mat-form-field { width: 120px; }
  `,
})
export class ProductDetailPage {
  /** Bound from the :id route param (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly quantity = signal(1);
  private readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly productRes = resource({ params: () => this.id(), loader: ({ params }) => this.catalog.getById(params) });
  protected readonly product = computed(() => (this.productRes.hasValue() ? this.productRes.value() : undefined));
  protected readonly specRows = computed<SpecRow[]>(() =>
    Object.entries(this.product()?.specs ?? {}).map(([key, v]) => ({ key, values: [v], differs: false })),
  );

  constructor() {
    // Page-scoped tools: registered while this page is open, unregistered when it is destroyed.
    void declareExperimentalWebMcpTool({
      name: 'get_current_product',
      title: 'Get current product',
      description: 'Get the product the user is currently viewing, with full specs and stock.',
      annotations: { readOnlyHint: true },
      execute: () => JSON.stringify(this.product() ?? { error: 'Product not found.' }),
    });
    void declareExperimentalWebMcpTool({
      name: 'add_current_product_to_cart',
      title: 'Add current product to cart',
      description: 'Add the product the user is currently viewing to the cart.',
      inputSchema: { type: 'object', properties: { quantity: { type: 'integer', minimum: 1, default: 1 } } },
      execute: async (args: Record<string, unknown>) => {
        const quantity = typeof args['quantity'] === 'number' ? args['quantity'] : 1;
        const result = await this.add(quantity);
        return JSON.stringify(result.ok ? { ok: true, cartCount: this.cart.count() } : { error: result.error });
      },
    });
  }

  protected async add(quantity: number) {
    const result = await this.cart.add(this.id(), quantity);
    this.snackBar.open(result.ok ? `${this.product()?.name} added to cart` : result.error, 'OK', { duration: 3000 });
    return result;
  }
}
