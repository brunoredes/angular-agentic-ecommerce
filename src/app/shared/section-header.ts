import { Component, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

/** Home section title ("Lead <accent>") with an underline and a "View all" link. */
@Component({
  selector: 'app-section-header',
  imports: [RouterLink, MatIconModule],
  template: `
    <h2 [id]="headingId()">{{ lead() }} <span class="accent">{{ accent() }}</span></h2>
    <a routerLink="/products" [queryParams]="viewAll()">
      View all<span class="cdk-visually-hidden"> {{ accent() }}</span>
      <mat-icon aria-hidden="true">chevron_right</mat-icon>
    </a>
  `,
  styles: `
    :host { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid var(--mat-sys-outline-variant); margin-bottom: 24px; }
    h2 { font: var(--mat-sys-title-large); margin: 0; padding-bottom: 10px; border-bottom: 3px solid var(--mat-sys-primary); margin-bottom: -2px; }
    .accent { color: var(--mat-sys-primary); font-weight: 600; }
    a { display: inline-flex; align-items: center; padding-bottom: 10px; color: var(--mat-sys-on-surface); text-decoration: none; font: var(--mat-sys-label-large); }
    a:hover { color: var(--mat-sys-primary); text-decoration: underline; }
    mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--mat-sys-primary); }
  `,
})
export class SectionHeader {
  readonly lead = input.required<string>();
  readonly accent = input.required<string>();
  readonly headingId = input.required<string>();
  readonly viewAll = input<Params>({});
}
