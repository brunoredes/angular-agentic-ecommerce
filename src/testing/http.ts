import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Product } from '../app/core/models/product';

export const provideTestHttp = () => [provideHttpClient(), provideHttpClientTesting()];

/** Waits for the code under test to issue a request (it may first await a lazy import), answers it and returns it. */
export async function respond(
  method: string,
  url: string,
  body: unknown,
  init?: { status: number; statusText: string },
): Promise<TestRequest> {
  const http = TestBed.inject(HttpTestingController);
  for (let i = 0; i < 100; i++) {
    const [req] = http.match((r) => r.method === method && r.url === url);
    if (req) {
      req.flush(body as never, init);
      return req;
    }
    await new Promise((r) => setTimeout(r, 5));
  }
  throw new Error(`Expected a ${method} ${url} request`);
}

export const product = (id: string, extra: Partial<Product> = {}): Product => ({
  id,
  name: id,
  brand: 'Brand',
  category: 'gpu',
  price: 100,
  stock: 5,
  description: '',
  specs: {},
  ...extra,
});
