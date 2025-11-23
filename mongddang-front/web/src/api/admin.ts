import type { CreateProductRequest, Product, ProductListResponse, UpdateProductRequest } from '../types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const ADMIN_API_BASE_URL = '/api/admin/v1';

export async function adminApiFetch<T>(
  path: string,
  options: RequestInit & { method?: HttpMethod } = {},
): Promise<T> {
  const url = `${ADMIN_API_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status} ${response.statusText}: ${text}`);
  }
  if (response.status === 204) return undefined as unknown as T;
  return (await response.json()) as T;
}

// 상품 목록 조회
export async function fetchAdminProducts(params?: {
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
  return adminApiFetch<ProductListResponse>(path);
}

// 상품 상세 조회
export async function fetchAdminProductById(id: string): Promise<Product> {
  return adminApiFetch<Product>(`/products/${id}`);
}

// 상품 등록
export async function createProduct(product: CreateProductRequest): Promise<Product> {
  return adminApiFetch<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

// 상품 수정
export async function updateProduct(id: string, product: UpdateProductRequest): Promise<Product> {
  return adminApiFetch<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

// 상품 삭제
export async function deleteProduct(id: string): Promise<void> {
  return adminApiFetch<void>(`/products/${id}`, {
    method: 'DELETE',
  });
}

// 이미지 업로드
export async function uploadProductImage(file: File): Promise<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${ADMIN_API_BASE_URL}/products/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status} ${response.statusText}: ${text}`);
  }
  
  return (await response.json()) as { imageUrl: string };
}

// 카테고리 관련 API
export type Category = {
  id: number;
  name: string;
  displayName: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryRequest = {
  name: string;
  displayName: string;
  displayOrder: number;
};

export type UpdateCategoryRequest = CreateCategoryRequest;

// 카테고리 목록 조회
export async function fetchCategories(): Promise<Category[]> {
  return adminApiFetch<Category[]>('/categories');
}

// 카테고리 상세 조회
export async function fetchCategoryById(id: number): Promise<Category> {
  return adminApiFetch<Category>(`/categories/${id}`);
}

// 카테고리 등록
export async function createCategory(category: CreateCategoryRequest): Promise<Category> {
  return adminApiFetch<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  });
}

// 카테고리 수정
export async function updateCategory(id: number, category: UpdateCategoryRequest): Promise<Category> {
  return adminApiFetch<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(category),
  });
}

// 카테고리 삭제
export async function deleteCategory(id: number): Promise<void> {
  return adminApiFetch<void>(`/categories/${id}`, {
    method: 'DELETE',
  });
}

