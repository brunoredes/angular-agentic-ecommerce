import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CATEGORIES, CATEGORY_META } from '../models/product';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="wrap">
      <div class="about">
        <a routerLink="/" class="logo">VoltShop</a>
        <p>Phones and PC hardware, with an AI shopping assistant that can search, compare and fill your cart for you.</p>
        <h2>Contact us</h2>
        <p class="contact"><mat-icon aria-hidden="true">mail</mat-icon> support&#64;voltshop.example</p>
      </div>
      <nav aria-labelledby="footer-categories">
        <h2 id="footer-categories">Popular categories</h2>
        <ul>
          @for (c of categories; track c) {
            <li><a routerLink="/products" [queryParams]="{ category: c }">{{ meta[c].label }}</a></li>
          }
        </ul>
      </nav>
      <nav aria-labelledby="footer-shop">
        <h2 id="footer-shop">Your account</h2>
        <ul>
          <li><a routerLink="/products">All products</a></li>
          <li><a routerLink="/cart">Cart</a></li>
          <li><a routerLink="/orders">Orders</a></li>
        </ul>
      </nav>
    </div>
    <p class="legal">VoltShop is a demo store. Prices and stock come from the demo API.</p>
  `,
  styles: `
    :host { display: block; position: relative; overflow: hidden; margin-top: 80px; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    :host::after { content: ''; position: absolute; right: -120px; top: -120px; width: 420px; height: 420px; border-radius: 50%; border: 60px solid rgb(255 255 255 / 0.06); pointer-events: none; }
    .wrap { display: grid; gap: 40px; grid-template-columns: 2fr 1fr 1fr; max-width: 1200px; margin: 0 auto; padding: 56px 16px 32px; }
    a { color: inherit; }
    .logo { font-size: 2.25rem; font-weight: 700; text-decoration: none; }
    p { max-width: 40ch; }
    h2 { font: var(--mat-sys-title-medium); margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 2px solid currentColor; display: inline-block; }
    nav h2 { margin-top: 0; }
    ul { list-style: disc; margin: 0; padding-left: 18px; display: grid; gap: 10px; }
    ul a { text-decoration: none; } ul a:hover, ul a:focus-visible { text-decoration: underline; }
    .contact { display: flex; align-items: center; gap: 8px; }
    .legal { max-width: none; margin: 0; padding: 20px 16px; text-align: center; border-top: 1px solid rgb(255 255 255 / 0.3); }
    @media (max-width: 720px) { .wrap { grid-template-columns: 1fr; } }
  `,
})
export class Footer {
  protected readonly categories = CATEGORIES;
  protected readonly meta = CATEGORY_META;
}
