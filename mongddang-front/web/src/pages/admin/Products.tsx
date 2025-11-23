import { useState, useEffect, useRef } from 'react';
import type { CreateProductRequest, Product, ProductListResponse, UpdateProductRequest } from '../../types';
import { ProductList } from '../../components/ProductList';
import { ProductForm } from '../../components/ProductForm';
import {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  type Category,
} from '../../api/admin';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        console.error('카테고리 로드 실패:', err);
      }
    };
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: ProductListResponse = await fetchAdminProducts({
        page: currentPage,
        size: pageSize,
        categoryId: categoryFilter || undefined,
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
  }, [currentPage, categoryFilter]);

  const handleCreate = async (productData: CreateProductRequest) => {
    try {
      await createProduct(productData);
      setIsModalOpen(false);
      setSelectedProduct(null);
      await loadProducts();
    } catch (err) {
      throw err;
    }
  };

  const handleUpdate = async (productData: CreateProductRequest) => {
    if (!selectedProduct) return;
    try {
      await updateProduct(selectedProduct.id, productData as UpdateProductRequest);
      setIsModalOpen(false);
      setSelectedProduct(null);
      await loadProducts();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : '상품 삭제에 실패했습니다.');
      console.error('상품 삭제 실패:', err);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    modalRef.current?.close();
  };

  useEffect(() => {
    if (isModalOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isModalOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    loadProducts();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">상품 관리</h1>
          <p className="text-base-content/70 mt-1">상품을 등록, 수정, 삭제할 수 있습니다.</p>
        </div>
        <button className="btn btn-primary" onClick={handleNewProduct}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          상품 등록
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="card bg-base-100 shadow mb-6">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
            <div className="form-control flex-1 min-w-[200px]">
              <input
                type="text"
                className="input input-bordered"
                placeholder="상품명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="form-control">
              <select
                className="select select-bordered"
                value={categoryFilter || ''}
                onChange={(e) => {
                  setCategoryFilter(e.target.value ? Number(e.target.value) : null);
                  setCurrentPage(0);
                }}
              >
                <option value="">전체 카테고리</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              검색
            </button>
          </form>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>
            닫기
          </button>
        </div>
      )}

      {/* 상품 목록 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-base-content/70">
              총 {totalElements}개의 상품
            </div>
          </div>
          <ProductList
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
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
        </div>
      </div>

      {/* 등록/수정 모달 */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg mb-4">
            {selectedProduct ? '상품 수정' : '상품 등록'}
          </h3>
          <ProductForm
            product={selectedProduct}
            onSubmit={selectedProduct ? handleUpdate : handleCreate}
            onCancel={handleModalClose}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={handleModalClose}>닫기</button>
        </form>
      </dialog>
    </div>
  );
}

