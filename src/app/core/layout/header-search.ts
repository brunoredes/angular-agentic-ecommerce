import { Component, computed, ElementRef, inject, resource, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { debounce, form, FormField, FormRoot } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CatalogService } from '../services/catalog.service';

const MAX_RESULTS = 6;

/** Header product search: debounced Signal Form with a results list below the field. */
@Component({
  selector: 'app-header-search',
  imports: [CurrencyPipe, RouterLink, FormRoot, FormField, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <search>
      <form [formRoot]="searchForm">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Search products</mat-label>
          <mat-icon matPrefix aria-hidden="true">search</mat-icon>
          <input
            matInput
            type="search"
            autocomplete="off"
            aria-controls="header-search-results"
            [attr.aria-describedby]="showResults() ? 'header-search-status' : null"
            [formField]="searchForm.query"
            (focus)="open.set(true)"
            (input)="open.set(true)"
          />
        </mat-form-field>
      </form>

      <div class="panel" id="header-search-results" [hidden]="!showResults()">
        <p id="header-search-status" role="status" class="status">
          @if (showResults()) {
            {{ results().length ? matchCount() + ' products found' : 'No products found' }}
          }
        </p>
        <ul aria-label="Search results">
          @for (p of results(); track p.id) {
            <li>
              <a [routerLink]="['/products', p.id]" (click)="reset()">
                <span class="name">{{ p.name }}</span>
                <span class="meta">{{ p.brand }} · {{ p.price | currency: 'USD' }}</span>
              </a>
            </li>
          }
        </ul>
        @if (matchCount() > results().length) {
          <a class="all" routerLink="/products" [queryParams]="{ q: query() }" (click)="reset()">See all {{ matchCount() }} results</a>
        }
      </div>
    </search>
  `,
  host: { '(focusout)': 'onFocusOut($event)', '(keydown.escape)': 'open.set(false)' },
  styles: `
    :host { display: block; position: relative; width: 100%; max-width: 480px; }
    mat-form-field { width: 100%; }
    .panel {
      position: absolute; inset-inline: 0; top: calc(100% + 4px); z-index: 10;
      background: var(--mat-sys-surface-container); color: var(--mat-sys-on-surface);
      border-radius: var(--mat-sys-corner-small); box-shadow: var(--mat-sys-level2);
      font: var(--mat-sys-body-medium);
    }
    .panel[hidden] { display: none; }
    .status { margin: 0; padding: 8px 16px; color: var(--mat-sys-on-surface-variant); }
    ul { list-style: none; margin: 0; padding: 0 0 8px; }
    a { display: flex; flex-direction: column; padding: 8px 16px; color: inherit; text-decoration: none; }
    a:hover, a:focus-visible { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); }
    a:focus-visible { outline: 2px solid var(--mat-sys-primary); outline-offset: -2px; }
    .meta { color: inherit; opacity: 0.85; font: var(--mat-sys-body-small); }
    .all { border-top: 1px solid var(--mat-sys-outline-variant); font-weight: 500; }
  `,
})
export class HeaderSearch {
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly model = signal({ query: '' });
  protected readonly searchForm = form(this.model, (p) => debounce(p.query, 300), {
    submission: {
      action: async () => {
        await this.router.navigate(['/products'], { queryParams: { q: this.query() || null } });
        this.open.set(false);
        return undefined;
      },
    },
  });

  protected readonly open = signal(false);
  /** The debounced value: the model only updates 300 ms after typing stops. */
  protected readonly query = computed(() => this.model().query.trim());
  private readonly search = resource({
    params: () => this.query() || undefined, // undefined: no request for an empty query
    loader: ({ params }) => this.catalog.search({ query: params }),
  });
  private readonly matches = computed(() => (this.query() && this.search.hasValue() ? this.search.value() : []));
  protected readonly matchCount = computed(() => this.matches().length);
  protected readonly results = computed(() => this.matches().slice(0, MAX_RESULTS));
  protected readonly showResults = computed(() => this.open() && !!this.query());

  protected onFocusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) this.open.set(false);
  }

  protected reset(): void {
    this.model.set({ query: '' });
    this.open.set(false);
  }
}
