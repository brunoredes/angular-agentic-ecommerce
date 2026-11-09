import { Component, input } from '@angular/core';

/** Stock state as text (not color alone) for accessibility. */
@Component({
  selector: 'app-stock-label',
  template: `{{ stock() ? (stock() < 5 ? 'Only ' + stock() + ' left' : 'In stock (' + stock() + ')') : 'Out of stock' }}`,
  host: { '[class.out]': '!stock()' },
  styles: `:host { font-size: 0.875rem; color: var(--mat-sys-on-surface-variant); } :host(.out) { color: var(--mat-sys-error); font-weight: 500; }`,
})
export class StockLabel {
  readonly stock = input.required<number>();
}
