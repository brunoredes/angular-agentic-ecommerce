import { inject, Service } from '@angular/core';
import { Product } from '../models/product';
import { CatalogService } from './catalog.service';

export interface SpecRow {
  key: string;
  values: (string | number | null)[];
  differs: boolean;
}

export interface Comparison {
  products: Product[];
  rows: SpecRow[];
  missing: string[];
}

/** Loaded lazily (injectAsync) by the compare page and the compare_products tool. */
@Service()
export class CompareService {
  private readonly catalog = inject(CatalogService);

  async compare(ids: readonly string[]): Promise<Comparison> {
    const unique = [...new Set(ids)];
    const found = new Map((await this.catalog.getMany(unique)).map((p) => [p.id, p]));
    const products = unique.flatMap((id) => found.get(id) ?? []); // keep the requested order
    const missing = unique.filter((id) => !found.has(id));
    const keys = ['Price (USD)', 'In stock', ...new Set(products.flatMap((p) => Object.keys(p.specs)))];
    const rows = keys.map((key) => {
      const values = products.map((p) =>
        key === 'Price (USD)' ? p.price : key === 'In stock' ? p.stock : (p.specs[key] ?? null),
      );
      return { key, values, differs: new Set(values).size > 1 };
    });
    return { products, rows, missing };
  }
}
