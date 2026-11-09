import { Component, input } from '@angular/core';
import { SpecRow } from '../core/services/compare.service';

/** Semantic table of specs; one column per product. */
@Component({
  selector: 'app-spec-table',
  template: `
    <table>
      <caption class="cdk-visually-hidden">{{ caption() }}</caption>
      <thead>
        <tr>
          <th scope="col">Spec</th>
          @for (h of headers(); track $index) { <th scope="col">{{ h }}</th> }
        </tr>
      </thead>
      <tbody>
        @for (row of rows(); track row.key) {
          <tr [class.differs]="highlightDiffs() && row.differs">
            <th scope="row">{{ row.key }}</th>
            @for (v of row.values; track $index) { <td>{{ v ?? '—' }}</td> }
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    :host { display: block; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    tbody th { font-weight: 500; color: var(--mat-sys-on-surface-variant); }
    tr.differs td { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); }
  `,
})
export class SpecTable {
  readonly caption = input.required<string>();
  readonly headers = input<string[]>([]);
  readonly rows = input.required<SpecRow[]>();
  readonly highlightDiffs = input(false);
}
