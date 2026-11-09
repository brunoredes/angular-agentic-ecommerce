import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { CATEGORIES, CATEGORY_META } from '../models/product';
import { CartService } from '../services/cart.service';
import { Footer } from './footer';
import { HeaderSearch } from './header-search';

const EXACT = { paths: 'exact', queryParams: 'exact', fragment: 'ignored', matrixParams: 'ignored' } as const;

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatBadgeModule, Footer, HeaderSearch],
  template: `
    <a class="skip-link" href="#main">Skip to content</a>
    <header>
      <div class="topbar">
        <div class="wrap">
          <p>Welcome to VoltShop</p>
          <ul aria-label="Store perks">
            <li><mat-icon aria-hidden="true">local_shipping</mat-icon> Ships worldwide</li>
            <li><mat-icon aria-hidden="true">autorenew</mat-icon> 30-day returns</li>
            <li><mat-icon aria-hidden="true">smart_toy</mat-icon> AI-agent ready</li>
          </ul>
        </div>
      </div>

      <div class="wrap main-row">
        <a routerLink="/" class="logo">
          <span class="logo-mark" aria-hidden="true"><mat-icon>bolt</mat-icon></span>
          <span>VoltShop</span>
        </a>
        @defer (on idle; hydrate on interaction) {
          <app-header-search class="search" />
        } @placeholder {
          <span class="search"></span>
        }
        <nav class="account" aria-label="Account">
          <a routerLink="/orders" routerLinkActive="active" ariaCurrentWhenActive="page">
            <mat-icon aria-hidden="true">receipt_long</mat-icon> Orders
          </a>
          <a routerLink="/cart" routerLinkActive="active" ariaCurrentWhenActive="page" [attr.aria-label]="'Cart, ' + cart.count() + ' items'">
            <mat-icon aria-hidden="true" [matBadge]="cart.count()" [matBadgeHidden]="!cart.count()" matBadgeSize="small">shopping_cart</mat-icon>
            Cart
          </a>
        </nav>
      </div>

      <nav class="categories" aria-label="Categories">
        <ul class="wrap">
          <li><a routerLink="/products" routerLinkActive="active" ariaCurrentWhenActive="page" [routerLinkActiveOptions]="exact">All products</a></li>
          @for (c of categories; track c) {
            <li>
              <a routerLink="/products" [queryParams]="{ category: c }" routerLinkActive="active" ariaCurrentWhenActive="page" [routerLinkActiveOptions]="exact">
                {{ meta[c].label }}
              </a>
            </li>
          }
        </ul>
      </nav>
    </header>
    <main id="main" tabindex="-1"><router-outlet /></main>
    <app-footer />
  `,
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly cart = inject(CartService);
  protected readonly categories = CATEGORIES;
  protected readonly meta = CATEGORY_META;
  protected readonly exact = EXACT;
}
