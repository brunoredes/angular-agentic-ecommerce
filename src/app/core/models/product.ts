export const CATEGORIES = ['phone', 'cpu', 'gpu', 'ram', 'storage'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  stock: number;
  description: string;
  specs: Record<string, string | number>;
}

export interface SearchFilters {
  query?: string;
  category?: Category;
  minPrice?: number;
  maxPrice?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

/** GET /api/cart */
export interface Cart {
  items: CartItem[];
  count: number;
  total: number;
}

export interface Order {
  id: string;
  email: string;
  status: string;
  total: number;
  createdAt: string;
  items: { productId: string; name: string; unitPrice: number; quantity: number }[];
}

/** Display label and Material Symbol per category (UI only). */
export const CATEGORY_META: Record<Category, { label: string; icon: string }> = {
  phone: { label: 'Smartphones', icon: 'smartphone' },
  cpu: { label: 'Processors', icon: 'memory' },
  gpu: { label: 'Graphics cards', icon: 'developer_board' },
  ram: { label: 'Memory', icon: 'memory_alt' },
  storage: { label: 'Storage', icon: 'hard_drive' },
};
