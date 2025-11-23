import type { Category } from './admin';
import { apiFetch } from './client';

// 일반 사용자용 카테고리 목록 조회
export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories');
}

