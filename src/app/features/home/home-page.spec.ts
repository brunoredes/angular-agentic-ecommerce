import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { product, provideTestHttp, respond } from '../../../testing/http';
import { HomePage } from './home-page';

describe('HomePage', () => {
  async function render(products: unknown) {
    TestBed.configureTestingModule({ imports: [HomePage], providers: [provideRouter([]), ...provideTestHttp()] });
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await respond('GET', '/api/products', products);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }
  const texts = (el: HTMLElement, sel: string) => [...el.querySelectorAll(sel)].map((n) => n.textContent!.trim());

  it('builds every section from the catalog', async () => {
    const { el } = await render([
      product('p1', { name: 'Phone A', category: 'phone', brand: 'Acme', price: 500 }),
      product('p2', { name: 'Phone B', category: 'phone', brand: 'Acme', price: 300 }),
      product('g1', { category: 'gpu', brand: 'Nova', price: 900 }),
      product('g2', { category: 'gpu', brand: 'Nova', price: 450 }),
      product('c1', { category: 'cpu', brand: 'Zed', price: 200 }),
      product('s1', { category: 'storage', brand: 'Ion', price: 120 }),
    ]);

    expect(texts(el, 'section[aria-labelledby="deals"] h3')).toEqual(['Phone A', 'Phone B']);
    // Ties on product count are ordered by name; only the top three brands are shown.
    expect(texts(el, '.brand-name')).toEqual(['Acme', 'Nova', 'Ion']);
    // "Build your PC" skips categories with no products (ram) and shows the cheapest price.
    expect(texts(el, '.tile-from')).toEqual(['From $200', 'From $450', 'From $120']);
    // First hero slide is the GPU one, priced from the cheapest GPU.
    expect(el.querySelector('app-hero-carousel .offer')?.textContent).toContain('From $450');
  });

  it('cycles hero slides with the next/previous buttons and dots', async () => {
    const { fixture, el } = await render([product('g1', { category: 'gpu' }), product('p1', { category: 'phone' })]);
    const slideLabel = () => el.querySelector('.slide')?.getAttribute('aria-label');
    expect(slideLabel()).toBe('1 of 2');

    el.querySelector<HTMLButtonElement>('[aria-label="Next slide"]')!.click();
    await fixture.whenStable();
    expect(slideLabel()).toBe('2 of 2');

    el.querySelector<HTMLButtonElement>('[aria-label="Next slide"]')!.click(); // wraps around
    await fixture.whenStable();
    expect(slideLabel()).toBe('1 of 2');

    el.querySelector<HTMLButtonElement>('[aria-label="Go to slide 2"]')!.click();
    await fixture.whenStable();
    expect(slideLabel()).toBe('2 of 2');
    expect(el.querySelector('[aria-label="Go to slide 2"]')?.getAttribute('aria-current')).toBe('true');
  });

  it('shows an alert when the catalog cannot load', async () => {
    TestBed.configureTestingModule({ imports: [HomePage], providers: [provideRouter([]), ...provideTestHttp()] });
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    await respond('GET', '/api/products', 'boom', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Could not load products');
    expect(el.querySelector('app-hero-carousel')).toBeNull();
  });
});
