import type { Product } from '../types';
import { mockProducts } from './mock';
import { apiFetch } from './client';

export async function fetchProducts(): Promise<Product[]> {
  try {
    return await apiFetch<Product[]>('/products');
  } catch {
    return mockProducts;
  }
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  try {
    return await apiFetch<Product>(`/products/${id}`);
  } catch {
    return mockProducts.find((p) => p.id === id);
  }
}


