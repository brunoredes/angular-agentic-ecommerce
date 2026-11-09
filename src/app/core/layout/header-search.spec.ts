import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { product, provideTestHttp, respond } from '../../../testing/http';
import { HeaderSearch } from './header-search';

describe('HeaderSearch', () => {
  async function setup() {
    TestBed.configureTestingModule({ imports: [HeaderSearch], providers: [provideRouter([]), provideTestHttp()] });
    const fixture = TestBed.createComponent(HeaderSearch);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    const type = (value: string) => {
      input.dispatchEvent(new Event('focus'));
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    const links = () => [...el.querySelectorAll('#header-search-results li a')].map((a) => a.querySelector('.name')?.textContent);
    return { fixture, el, type, links };
  }

  it('renders a labelled search input inside <search><form>', async () => {
    const { el } = await setup();
    expect(el.querySelector('search > form input[type="search"]')).toBeTruthy();
    expect(el.querySelector('mat-label')?.textContent).toContain('Search products');
  });

  it('filters the list only after the debounce', async () => {
    const { fixture, el, type, links } = await setup();
    type('ryzen');
    await fixture.whenStable();
    expect(links()).toEqual([]); // still debouncing

    await new Promise((r) => setTimeout(r, 350));
    const req = await respond('GET', '/api/products', [
      product('ryzen-7-9800x3d', { name: 'Ryzen 7 9800X3D' }),
      product('ryzen-9-9950x', { name: 'Ryzen 9 9950X' }),
    ]);
    expect(req.request.params.get('query')).toBe('ryzen');
    await fixture.whenStable();
    expect(links()).toEqual(['Ryzen 7 9800X3D', 'Ryzen 9 9950X']);
    expect(el.querySelector('[role="status"]')?.textContent).toContain('2 products found');
  });

  it('shows an empty state and caps the list with a "see all" link', async () => {
    const { fixture, el, type, links } = await setup();
    type('zzz');
    await new Promise((r) => setTimeout(r, 350));
    await respond('GET', '/api/products', []);
    await fixture.whenStable();
    expect(el.querySelector('[role="status"]')?.textContent).toContain('No products found');

    type('a'); // matches most of the catalog
    await new Promise((r) => setTimeout(r, 350));
    await respond('GET', '/api/products', ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => product(id)));
    await fixture.whenStable();
    expect(links()).toHaveLength(6);
    expect(el.querySelector('a.all')?.textContent).toContain('See all');
  });
});
