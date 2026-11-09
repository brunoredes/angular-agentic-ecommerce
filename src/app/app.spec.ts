import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTestHttp } from '../testing/http';
import { App } from './app';

describe('App', () => {
  it('renders the shell with a cart link', async () => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([]), provideTestHttp()] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a[href="/cart"]')?.getAttribute('aria-label')).toBe('Cart, 0 items');
  });
});
