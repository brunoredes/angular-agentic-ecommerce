import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { CATEGORIES, CATEGORY_META, Category } from '../../core/models/product';
import { CatalogService } from '../../core/services/catalog.service';
import { ProductCard } from '../../shared/product-card';

@Component({
  selector: 'app-catalog-page',
  imports: [RouterLink, MatFormFieldModule, MatInputModule, MatChipsModule, MatButtonModule, ProductCard],
  template: `
    <h1>{{ heading() }}</h1>
    <div class="filters">
      <mat-form-field appearance="outline">
        <mat-label>Search products</mat-label>
        <input matInput type="search" [value]="q() ?? ''" (input)="setParams({ q: $any($event.target).value || null })" />
      </mat-form-field>
      <mat-chip-listbox aria-label="Category" [value]="category()" (change)="setParams({ category: $event.value ?? null })">
        @for (c of categories; track c) { <mat-chip-option [value]="c">{{ meta[c].label }}</mat-chip-option> }
      </mat-chip-listbox>
    </div>

    <p role="status">
      @if (search.error()) { Could not load products. Please try again. }
      @else if (!search.isLoading()) { {{ results().length }} products found }
    </p>
    @if (selected().size >= 2) {
      <a mat-flat-button [routerLink]="['/compare']" [queryParams]="{ ids: [...selected()].join(',') }">
        Compare {{ selected().size }} products
      </a>
    }

    <h2 class="cdk-visually-hidden">Results</h2>
    <ul class="grid">
      @for (p of results(); track p.id) {
        <li><app-product-card [product]="p" [comparable]="true" [compared]="selected().has(p.id)" (comparedChange)="toggle(p.id, $event)" /></li>
      }
    </ul>
  `,
  styles: `
    .filters { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
    .grid { list-style: none; padding: 0; display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
  `,
})
export class CatalogPage {
  /** Bound from query params (withComponentInputBinding). */
  readonly q = input<string>();
  readonly category = input<Category>();

  protected readonly categories = CATEGORIES;
  protected readonly meta = CATEGORY_META;
  protected readonly heading = computed(() => CATEGORY_META[this.category()!]?.label ?? 'All products');
  protected readonly selected = signal(new Set<string>());
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);

  protected readonly search = resource({
    params: () => ({ query: this.q(), category: CATEGORIES.includes(this.category()!) ? this.category() : undefined }),
    loader: ({ params }) => this.catalog.search(params),
  });
  protected readonly results = computed(() => (this.search.hasValue() ? this.search.value() : []));

  protected setParams(queryParams: Record<string, string | null>): void {
    void this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected toggle(id: string, on: boolean): void {
    this.selected.update((s) => {
      const next = new Set(s);
      if (on && next.size < 4) next.add(id);
      else next.delete(id);
      return next;
    });
  }
}
