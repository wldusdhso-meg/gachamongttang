import { useState, useEffect } from 'react';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CreateCategoryRequest,
} from '../../api/admin';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    displayName: '',
    displayOrder: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (err) {
      setError(err instanceof Error ? err.message : '카테고리 목록을 불러오는데 실패했습니다.');
      console.error('카테고리 목록 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '카테고리명은 필수입니다.';
    } else if (formData.name.length > 100) {
      newErrors.name = '카테고리명은 100자 이하여야 합니다.';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = '표시명은 필수입니다.';
    } else if (formData.displayName.length > 100) {
      newErrors.displayName = '표시명은 100자 이하여야 합니다.';
    }

    if (formData.displayOrder < 0) {
      newErrors.displayOrder = '표시 순서는 0 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createCategory(formData);
      setIsModalOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', displayName: '', displayOrder: 0 });
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : '카테고리 등록에 실패했습니다.');
      console.error('카테고리 등록 실패:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory || !validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCategory(selectedCategory.id, formData);
      setIsModalOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', displayName: '', displayOrder: 0 });
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : '카테고리 수정에 실패했습니다.');
      console.error('카테고리 수정 실패:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : '카테고리 삭제에 실패했습니다.');
      console.error('카테고리 삭제 실패:', err);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      displayName: category.displayName,
      displayOrder: category.displayOrder,
    });
    setIsModalOpen(true);
  };

  const handleNewCategory = () => {
    setSelectedCategory(null);
    setFormData({ name: '', displayName: '', displayOrder: 0 });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setFormData({ name: '', displayName: '', displayOrder: 0 });
    setErrors({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">카테고리 관리</h1>
          <p className="text-base-content/70 mt-1">카테고리를 등록, 수정, 삭제할 수 있습니다.</p>
        </div>
        <button className="btn btn-primary" onClick={handleNewCategory}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          카테고리 등록
        </button>
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

      {/* 카테고리 목록 */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              등록된 카테고리가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>카테고리명</th>
                    <th>표시명</th>
                    <th>표시 순서</th>
                    <th>등록일</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td>
                        <span className="font-mono text-sm">{category.name}</span>
                      </td>
                      <td>{category.displayName}</td>
                      <td>{category.displayOrder}</td>
                      <td>
                        {new Date(category.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEdit(category)}
                          >
                            수정
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => {
                              if (confirm(`"${category.displayName}" 카테고리를 삭제하시겠습니까?`)) {
                                handleDelete(category.id);
                              }
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 등록/수정 모달 */}
      {isModalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {selectedCategory ? '카테고리 수정' : '카테고리 등록'}
            </h3>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">카테고리명</span>
                  <span className="label-text-alt text-error">필수</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: ACCESSORY"
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.name}</span>
                  </label>
                )}
                <label className="label">
                  <span className="label-text-alt">영문 대문자로 입력하세요 (예: ACCESSORY, STATIONERY)</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">표시명</span>
                  <span className="label-text-alt text-error">필수</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${errors.displayName ? 'input-error' : ''}`}
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="예: 액세서리"
                />
                {errors.displayName && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.displayName}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">표시 순서</span>
                </label>
                <input
                  type="number"
                  className={`input input-bordered ${errors.displayOrder ? 'input-error' : ''}`}
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                />
                {errors.displayOrder && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.displayOrder}</span>
                  </label>
                )}
                <label className="label">
                  <span className="label-text-alt">숫자가 작을수록 먼저 표시됩니다</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleModalClose}
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={selectedCategory ? handleUpdate : handleCreate}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    처리 중...
                  </>
                ) : (
                  selectedCategory ? '수정' : '등록'
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={handleModalClose}>닫기</button>
          </form>
        </dialog>
      )}
    </div>
  );
}

