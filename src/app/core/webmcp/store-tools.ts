import { inject, injectAsync, WebMcpToolDescriptor } from '@angular/core';
import { CATEGORIES, Category } from '../models/product';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';

// Agent input is untrusted: every tool re-validates its arguments instead of trusting inputSchema.
type Args = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const json = (v: unknown) => JSON.stringify(v);
const error = (message: string) => json({ error: message });

const productId = { type: 'string', description: 'Product id, as returned by search_products.' } as const;

export const STORE_TOOLS: WebMcpToolDescriptor[] = [
  {
    name: 'search_products',
    title: 'Search products',
    description:
      'Search the electronics catalog (phones, CPUs, GPUs, RAM, storage). All filters are optional; no filters returns everything.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free text matched against name, brand and description.' },
        category: { type: 'string', enum: CATEGORIES },
        minPrice: { type: 'number', description: 'Minimum price in USD.' },
        maxPrice: { type: 'number', description: 'Maximum price in USD.' },
      },
    },
    annotations: { readOnlyHint: true },
    execute: async (args: Args) => {
      const category = str(args['category']);
      if (category && !CATEGORIES.includes(category as Category)) {
        return error(`category must be one of: ${CATEGORIES.join(', ')}.`);
      }
      const results = await inject(CatalogService).search({
        query: str(args['query']),
        category: category as Category | undefined,
        minPrice: num(args['minPrice']),
        maxPrice: num(args['maxPrice']),
      });
      return json(results.map(({ id, name, brand, category, price, stock }) => ({ id, name, brand, category, price, stock })));
    },
  },
  {
    name: 'get_product',
    title: 'Get product details',
    description: 'Get the full description and technical specs of one product.',
    inputSchema: { type: 'object', properties: { id: productId }, required: ['id'] },
    annotations: { readOnlyHint: true },
    execute: async (args: Args) => {
      const product = await inject(CatalogService).getById(str(args['id']) ?? '');
      return product ? json(product) : error(`Unknown product "${String(args['id'])}".`);
    },
  },
  {
    name: 'compare_products',
    title: 'Compare products',
    description:
      'Compare 2 to 4 products side by side. Returns one row per spec with each product\'s value and whether they differ.',
    inputSchema: {
      type: 'object',
      properties: { ids: { type: 'array', items: productId, minItems: 2, maxItems: 4 } },
      required: ['ids'],
    },
    annotations: { readOnlyHint: true },
    execute: async (args: Args) => {
      const ids = Array.isArray(args['ids']) ? args['ids'].filter((id) => typeof id === 'string') : [];
      if (ids.length < 2 || ids.length > 4) return error('ids must contain 2 to 4 product ids.');
      const compare = injectAsync(() => import('../services/compare.service').then((m) => m.CompareService));
      const { products, rows, missing } = await (await compare()).compare(ids);
      return json({ products: products.map((p) => ({ id: p.id, name: p.name })), rows, missing });
    },
  },
  {
    name: 'check_inventory',
    title: 'Check inventory',
    description: 'Check how many units of a product are in stock.',
    inputSchema: { type: 'object', properties: { id: productId }, required: ['id'] },
    annotations: { readOnlyHint: true },
    execute: async (args: Args) => {
      const stock = await inject(CatalogService).inventory(str(args['id']) ?? '');
      return stock ? json(stock) : error(`Unknown product "${String(args['id'])}".`);
    },
  },
  {
    name: 'add_to_cart',
    title: 'Add to cart',
    description: "Add a quantity of a product to the user's cart. Fails if there is not enough stock.",
    inputSchema: {
      type: 'object',
      properties: { id: productId, quantity: { type: 'integer', minimum: 1, default: 1 } },
      required: ['id'],
    },
    execute: async (args: Args) => {
      const cart = inject(CartService);
      const result = await cart.add(str(args['id']) ?? '', num(args['quantity']) ?? 1);
      return result.ok ? json({ ok: true, cartCount: cart.count(), cartTotal: cart.total() }) : error(result.error);
    },
  },
  {
    name: 'view_cart',
    title: 'View cart',
    description: "List the items in the user's cart with quantities, subtotals and the total in USD.",
    annotations: { readOnlyHint: true },
    execute: async () => {
      const cart = inject(CartService);
      await cart.refresh(); // the cart may have changed in another tab
      return json({
        items: cart.items().map((i) => ({ id: i.product.id, name: i.product.name, quantity: i.quantity, subtotal: i.subtotal })),
        total: cart.total(),
      });
    },
  },
];
