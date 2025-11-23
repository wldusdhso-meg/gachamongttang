import { useEffect, useState } from 'react';
import { fetchProducts } from '../api/products';
import { fetchCategories } from '../api/categories';
import type { Category } from '../api/admin';
import type { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [, setTotalElements] = useState(0);
  const pageSize = 20;
  const { addToCart } = useCart();

  // 카테고리 목록 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // 일반 사용자용 카테고리 API가 없으므로 admin API 사용 (추후 수정 필요)
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        console.error('카테고리 로드 실패:', err);
      }
    };
    loadCategories();
  }, []);

  // 상품 목록 로드
  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchProducts({
        page: currentPage,
        size: pageSize,
        categoryId: selectedCategoryId || undefined,
        search: searchQuery || undefined,
      });
      setProducts(response.products);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : '상품 목록을 불러오는데 실패했습니다.');
      console.error('상품 목록 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategoryId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    loadProducts();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-semibold">상품 목록</h1>
          <p className="text-base-content/70">원하는 소품을 검색해 보세요.</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <label className="input input-bordered flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 111.06-1.06l2.755 2.754a.75.75 0 11-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0Z" clipRule="evenodd" /></svg>
            <input 
              type="text" 
              className="grow" 
              placeholder="검색" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </label>
          <select 
            className="select select-bordered" 
            value={selectedCategoryId || ''} 
            onChange={(e) => {
              setSelectedCategoryId(e.target.value ? Number(e.target.value) : null);
              setCurrentPage(0);
            }}
          >
            <option value="">전체</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.displayName}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            검색
          </button>
        </form>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => {
            setError(null);
            loadProducts();
          }}>
            다시 시도
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : error ? null : products.length === 0 ? (
        <div className="text-center py-8 text-base-content/50">
          <p className="text-lg mb-2">상품이 없습니다.</p>
          <p className="text-sm">다른 검색어나 카테고리를 선택해보세요.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={() => addToCart(p.id, 1)} />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="join">
                <button
                  className="join-item btn"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  «
                </button>
                {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                  <button
                    key={page}
                    className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page + 1}
                  </button>
                ))}
                <button
                  className="join-item btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}


