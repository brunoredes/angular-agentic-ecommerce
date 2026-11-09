import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Catalog and product pages show live prices and stock from the API, so render per request instead of prerendering.
  { path: '', renderMode: RenderMode.Server },
  { path: 'products', renderMode: RenderMode.Server },
  { path: 'products/:id', renderMode: RenderMode.Server },
  // Depend on query params or the session cookie (cart, orders), so render on the client.
  { path: 'compare', renderMode: RenderMode.Client },
  { path: 'cart', renderMode: RenderMode.Client },
  { path: 'checkout', renderMode: RenderMode.Client },
  { path: 'orders', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
