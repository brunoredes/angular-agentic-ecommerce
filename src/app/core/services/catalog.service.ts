import { inject, Service } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Product, SearchFilters } from '../models/product';

/** Catalog reads from the backend (GET /api/products). */
@Service()
export class CatalogService {
  private readonly http = inject(HttpClient);

  search({ query, category, minPrice, maxPrice }: SearchFilters = {}): Promise<Product[]> {
    const params: Record<string, string | number> = {};
    if (query?.trim()) params['query'] = query.trim();
    if (category) params['category'] = category;
    if (minPrice !== undefined) params['minPrice'] = minPrice;
    if (maxPrice !== undefined) params['maxPrice'] = maxPrice;
    return firstValueFrom(this.http.get<Product[]>('/api/products', { params }));
  }

  /** Products for the given ids, in catalog order; unknown ids are left out. */
  getMany(ids: readonly string[]): Promise<Product[]> {
    return firstValueFrom(this.http.get<Product[]>('/api/products', { params: { ids: ids.join(',') } }));
  }

  /** Resolves undefined for an unknown id; other failures reject. */
  async getById(id: string): Promise<Product | undefined> {
    try {
      return await firstValueFrom(this.http.get<Product>(`/api/products/${encodeURIComponent(id)}`));
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 404) return undefined;
      throw e;
    }
  }

  async inventory(id: string): Promise<{ id: string; stock: number; available: boolean } | undefined> {
    const p = await this.getById(id);
    return p && { id: p.id, stock: p.stock, available: p.stock > 0 };
  }
}
