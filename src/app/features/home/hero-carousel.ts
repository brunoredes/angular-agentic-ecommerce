import { Component, computed, input, signal } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface HeroSlide {
  eyebrow: string;
  title: string;
  offer: string;
  icon: string;
  query: Params;
}

/** Manual carousel (no autoplay, so nothing moves without the user, WCAG 2.2.2). */
@Component({
  selector: 'app-hero-carousel',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    @if (slide(); as s) {
      <section aria-roledescription="carousel" aria-label="Featured deals">
        <div class="slide" aria-roledescription="slide" [attr.aria-label]="index() + 1 + ' of ' + slides().length" aria-live="polite">
          <div class="copy">
            <p class="eyebrow">{{ s.eyebrow }}</p>
            <p class="title">{{ s.title }}</p>
            <p class="offer">{{ s.offer }}</p>
            <a mat-flat-button routerLink="/products" [queryParams]="s.query">Shop now</a>
          </div>
          <div class="art" aria-hidden="true"><mat-icon>{{ s.icon }}</mat-icon></div>
        </div>
        @if (slides().length > 1) {
          <button mat-mini-fab class="nav prev" aria-label="Previous slide" (click)="go(-1)"><mat-icon aria-hidden="true">chevron_left</mat-icon></button>
          <button mat-mini-fab class="nav next" aria-label="Next slide" (click)="go(1)"><mat-icon aria-hidden="true">chevron_right</mat-icon></button>
          <div class="dots">
            @for (d of slides(); track $index) {
              <button type="button" [class.on]="$index === index()" [attr.aria-label]="'Go to slide ' + ($index + 1)" [attr.aria-current]="$index === index()" (click)="index.set($index)"></button>
            }
          </div>
        }
      </section>
    }
  `,
  styles: `
    section { position: relative; margin: 8px 24px 0; }
    .slide { display: flex; align-items: center; justify-content: space-between; gap: 24px; min-height: 270px; padding: 32px 56px; border-radius: 16px; background: #212844; color: #fff; overflow: hidden; }
    .copy p { margin: 0; }
    .eyebrow { font: var(--mat-sys-title-large); }
    .title { font-size: clamp(2rem, 5vw, 3rem); font-weight: 700; letter-spacing: 0.02em; margin: 8px 0 !important; }
    .offer { font: var(--mat-sys-headline-small); margin-bottom: 20px !important; }
    .copy a { --mat-button-filled-container-color: #fff; --mat-button-filled-label-text-color: #212844; }
    .art { flex: none; display: grid; place-items: center; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, #3b4a8a 0%, #2a3360 70%); }
    .art mat-icon { font-size: 140px; width: 140px; height: 140px; color: #cfe0ff; }
    .nav { position: absolute; top: 50%; translate: 0 -50%; --mat-fab-small-container-color: var(--mat-sys-surface); --mat-fab-small-foreground-color: var(--mat-sys-primary); }
    .prev { left: -20px; }
    .next { right: -20px; }
    .dots { position: absolute; left: 56px; bottom: 16px; display: flex; gap: 6px; }
    .dots button { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 4px; background: rgba(255, 255, 255, 0.6); cursor: pointer; transition: width 150ms; }
    .dots button.on { width: 24px; background: #fff; }
    .dots button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
    @media (max-width: 720px) {
      section { margin-inline: 0; }
      .slide { padding: 24px 24px 40px; }
      .art { display: none; }
      .nav { display: none; }
      .dots { left: 24px; }
    }
  `,
})
export class HeroCarousel {
  readonly slides = input.required<HeroSlide[]>();
  protected readonly index = signal(0);
  protected readonly slide = computed(() => this.slides()[this.index()] ?? this.slides()[0]);

  protected go(step: number): void {
    const n = this.slides().length;
    this.index.update((i) => (i + step + n) % n);
  }
}
