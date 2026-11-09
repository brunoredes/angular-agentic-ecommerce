import { Component, computed, inject, resource } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CATEGORIES, CATEGORY_META, Category, Product } from '../../core/models/product';
import { CatalogService } from '../../core/services/catalog.service';
import { ProductCard } from '../../shared/product-card';
import { SectionHeader } from '../../shared/section-header';
import { HeroCarousel, HeroSlide } from './hero-carousel';

const PC_PARTS: Category[] = ['cpu', 'gpu', 'ram', 'storage'];
const BRAND_TONES = ['dark', 'sun', 'peach'] as const;

@Component({
  selector: 'app-home-page',
  imports: [CurrencyPipe, RouterLink, MatIconModule, HeroCarousel, ProductCard, SectionHeader],
  template: `
    <h1 class="cdk-visually-hidden">VoltShop: phones and PC hardware</h1>

    @if (catalog.error()) {
      <p role="alert" class="notice">Could not load products. Please try again later.</p>
    } @else if (catalog.isLoading()) {
      <p role="status" class="notice">Loading deals…</p>
    } @else {
      <app-hero-carousel [slides]="slides()" />

      <section aria-labelledby="deals">
        <app-section-header headingId="deals" lead="Grab the best deal on" accent="Smartphones" [viewAll]="{ category: 'phone' }" />
        <ul class="row">
          @for (p of phones(); track p.id) { <li><app-product-card [product]="p" /></li> }
        </ul>
      </section>

      <section aria-labelledby="categories">
        <app-section-header headingId="categories" lead="Shop from" accent="Top Categories" />
        <ul class="circles">
          @for (c of categories; track c) {
            <li>
              <a routerLink="/products" [queryParams]="{ category: c }">
                <span class="circle"><mat-icon aria-hidden="true">{{ meta[c].icon }}</mat-icon></span>
                {{ meta[c].label }}
              </a>
            </li>
          }
        </ul>
      </section>

      <section aria-labelledby="brands">
        <app-section-header headingId="brands" lead="Top" accent="Electronics Brands" />
        <ul class="brands">
          @for (b of brands(); track b.name; let i = $index) {
            <li>
              <a [class]="'brand ' + tones[i]" routerLink="/products" [queryParams]="{ q: b.name }">
                <span class="tag">{{ b.name }}</span>
                <span class="brand-name">{{ b.name }}</span>
                <span class="from">{{ b.count }} products · from {{ b.from | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
                <mat-icon aria-hidden="true">{{ b.icon }}</mat-icon>
              </a>
            </li>
          }
        </ul>
      </section>

      <section aria-labelledby="build">
        <app-section-header headingId="build" lead="Build your" accent="PC" />
        <ul class="tiles">
          @for (t of parts(); track t.category) {
            <li>
              <a routerLink="/products" [queryParams]="{ category: t.category }">
                <span class="tile"><mat-icon aria-hidden="true">{{ meta[t.category].icon }}</mat-icon></span>
                <span class="tile-label">{{ meta[t.category].label }}</span>
                <span class="tile-from">From {{ t.from | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
              </a>
            </li>
          }
        </ul>
      </section>
    }
  `,
  styleUrl: './home-page.scss',
})
export class HomePage {
  protected readonly categories = CATEGORIES;
  protected readonly meta = CATEGORY_META;
  protected readonly tones = BRAND_TONES;
  private readonly catalogService = inject(CatalogService);

  protected readonly catalog = resource({ loader: () => this.catalogService.search() });
  private readonly products = computed<Product[]>(() => (this.catalog.hasValue() ? this.catalog.value() : []));

  protected readonly phones = computed(() => this.inCategory('phone').slice(0, 5));

  protected readonly slides = computed<HeroSlide[]>(() =>
    (
      [
        ['gpu', 'Best deals on graphics cards', 'NEXT-GEN GRAPHICS.'],
        ['phone', 'Flagship phones, in stock now', 'POCKET POWER.'],
        ['storage', 'Fast NVMe for every build', 'LOAD IN A BLINK.'],
      ] as const
    ).flatMap(([category, eyebrow, title]) => {
      const from = this.minPrice(category);
      return from === undefined ? [] : [{ eyebrow, title, offer: `From $${from}`, icon: CATEGORY_META[category].icon, query: { category } }];
    }),
  );

  /** The three brands with the most products. */
  protected readonly brands = computed(() => {
    const byBrand = new Map<string, Product[]>();
    for (const p of this.products()) byBrand.set(p.brand, [...(byBrand.get(p.brand) ?? []), p]);
    return [...byBrand]
      .map(([name, list]) => ({ name, count: list.length, from: Math.min(...list.map((p) => p.price)), icon: CATEGORY_META[list[0].category].icon }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 3);
  });

  protected readonly parts = computed(() =>
    PC_PARTS.flatMap((category) => {
      const from = this.minPrice(category);
      return from === undefined ? [] : [{ category, from }];
    }),
  );

  private inCategory(category: Category): Product[] {
    return this.products().filter((p) => p.category === category);
  }

  private minPrice(category: Category): number | undefined {
    const prices = this.inCategory(category).map((p) => p.price);
    return prices.length ? Math.min(...prices) : undefined;
  }
}
