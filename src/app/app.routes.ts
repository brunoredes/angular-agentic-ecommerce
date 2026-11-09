import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'VoltShop · Phones and PC hardware', loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage) },
  { path: 'products', title: 'Products · VoltShop', loadComponent: () => import('./features/catalog/catalog-page').then((m) => m.CatalogPage) },
  { path: 'products/:id', title: 'Product · VoltShop', loadComponent: () => import('./features/product-detail/product-detail-page').then((m) => m.ProductDetailPage) },
  { path: 'compare', title: 'Compare · VoltShop', loadComponent: () => import('./features/compare/compare-page').then((m) => m.ComparePage) },
  { path: 'cart', title: 'Cart · VoltShop', loadComponent: () => import('./features/cart/cart-page').then((m) => m.CartPage) },
  { path: 'checkout', title: 'Checkout · VoltShop', loadComponent: () => import('./features/checkout/checkout-page').then((m) => m.CheckoutPage) },
  { path: 'orders', title: 'Orders · VoltShop', loadComponent: () => import('./features/orders/orders-page').then((m) => m.OrdersPage) },
  { path: '**', redirectTo: '' },
];
