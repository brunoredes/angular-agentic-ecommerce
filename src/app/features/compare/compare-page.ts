import { Component, computed, injectAsync, input, onIdle, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpecTable } from '../../shared/spec-table';

@Component({
  selector: 'app-compare-page',
  imports: [RouterLink, MatButtonModule, MatProgressSpinnerModule, SpecTable],
  template: `
    <a mat-button routerLink="/products">← Back to catalog</a>
    <h1>Compare products</h1>
    @if (comparison.isLoading()) {
      <mat-progress-spinner mode="indeterminate" diameter="32" aria-label="Loading comparison" />
    } @else if (comparison.value(); as c) {
      @if (c.missing.length) { <p role="alert">Unknown products: {{ c.missing.join(', ') }}</p> }
      @if (c.products.length >= 2) {
        <p>Highlighted rows differ between products.</p>
        <app-spec-table caption="Product comparison" [headers]="headers()" [rows]="c.rows" [highlightDiffs]="true" />
      } @else {
        <p>Select at least two products in the catalog to compare.</p>
      }
    }
  `,
})
export class ComparePage {
  /** Comma-separated product ids from the ?ids= query param. */
  readonly ids = input<string>('');

  // Async DI: the comparison logic is its own chunk, prefetched when the browser is idle.
  private readonly compareService = injectAsync(
    () => import('../../core/services/compare.service').then((m) => m.CompareService),
    { prefetch: onIdle },
  );

  protected readonly comparison = resource({
    params: () => this.ids().split(',').map((id) => id.trim()).filter(Boolean).slice(0, 4),
    loader: async ({ params }) => (await this.compareService()).compare(params),
  });
  protected readonly headers = computed(() => this.comparison.value()?.products.map((p) => p.name) ?? []);
}
