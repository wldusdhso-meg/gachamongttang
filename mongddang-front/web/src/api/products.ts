import type { Product, ProductListResponse } from '../types';
import { apiFetch } from './client';

export async function fetchProducts(params?: {
  page?: number;
  size?: number;
  categoryId?: number;
  search?: string;
}): Promise<ProductListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.categoryId !== undefined) queryParams.append('categoryId', params.categoryId.toString());
  if (params?.search) queryParams.append('search', params.search);
  
  const queryString = queryParams.toString();
  const path = `/products${queryString ? `?${queryString}` : ''}`;
  return apiFetch<ProductListResponse>(path);
}

export async function fetchProductById(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}


