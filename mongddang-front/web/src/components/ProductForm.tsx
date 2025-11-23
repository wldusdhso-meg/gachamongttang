import { useState, useEffect } from 'react';
import type { CreateProductRequest, Product } from '../types';
import { ImageUpload } from './ImageUpload';
import { RichTextEditor } from './RichTextEditor';
import { fetchCategories, type Category } from '../api/admin';

type Props = {
  product?: Product | null;
  onSubmit: (product: CreateProductRequest) => Promise<void>;
  onCancel: () => void;
};

export function ProductForm({ product, onSubmit, onCancel }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    description: null,
    detailDescription: null,
    price: 0,
    imageUrl: null,
    categoryId: 0,
    stock: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoryError(null);
        const cats = await fetchCategories();
        setCategories(cats);
        if (cats.length > 0 && !product && formData.categoryId === 0) {
          setFormData((prev) => ({ ...prev, categoryId: cats[0].id }));
        }
      } catch (err) {
        console.error('카테고리 로드 실패:', err);
        setCategoryError('카테고리를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || null,
        detailDescription: product.detailDescription || null,
        price: product.price,
        imageUrl: product.imageUrl || null,
        categoryId: product.categoryId,
        stock: product.stock,
      });
    }
  }, [product]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '상품명은 필수입니다.';
    } else if (formData.name.length > 255) {
      newErrors.name = '상품명은 255자 이하여야 합니다.';
    }

    if (formData.price <= 0) {
      newErrors.price = '가격은 0보다 커야 합니다.';
    }

    if (formData.stock < 0) {
      newErrors.stock = '재고는 0 이상이어야 합니다.';
    }

    if (!formData.categoryId || formData.categoryId === 0) {
      newErrors.category = '카테고리는 필수입니다.';
    }

    if (!formData.imageUrl) {
      newErrors.imageUrl = '이미지는 필수입니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('제출 실패:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">상품명</span>
          <span className="label-text-alt text-error">필수</span>
        </label>
        <input
          type="text"
          className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="상품명을 입력하세요"
        />
        {errors.name && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.name}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">설명</span>
        </label>
        <textarea
          className="textarea textarea-bordered"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
          placeholder="상품 설명을 입력하세요"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">가격</span>
            <span className="label-text-alt text-error">필수</span>
          </label>
          <input
            type="number"
            className={`input input-bordered ${errors.price ? 'input-error' : ''}`}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            placeholder="0"
            min="0"
            step="0.01"
          />
          {errors.price && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.price}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">재고</span>
            <span className="label-text-alt text-error">필수</span>
          </label>
          <input
            type="number"
            className={`input input-bordered ${errors.stock ? 'input-error' : ''}`}
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
            placeholder="0"
            min="0"
          />
          {errors.stock && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.stock}</span>
            </label>
          )}
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">카테고리</span>
          <span className="label-text-alt text-error">필수</span>
        </label>
        {isLoadingCategories ? (
          <span className="loading loading-spinner"></span>
        ) : categoryError ? (
          <div className="alert alert-error">
            <span>{categoryError}</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="alert alert-warning">
            <span>등록된 카테고리가 없습니다. 먼저 카테고리를 등록해주세요.</span>
          </div>
        ) : (
          <select
            className={`select select-bordered ${errors.category ? 'select-error' : ''}`}
            value={formData.categoryId || ''}
            onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
          >
            <option value="">카테고리를 선택하세요</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.displayName}
              </option>
            ))}
          </select>
        )}
        {errors.category && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.category}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <ImageUpload
          onUploadComplete={(imageUrl) => setFormData({ ...formData, imageUrl })}
          initialImageUrl={formData.imageUrl}
        />
        {errors.imageUrl && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.imageUrl}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">상품 상세보기</span>
        </label>
        <RichTextEditor
          value={formData.detailDescription}
          onChange={(value) => setFormData({ ...formData, detailDescription: value })}
          placeholder="상품 상세 정보를 입력하세요"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
          취소
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              처리 중...
            </>
          ) : (
            product ? '수정' : '등록'
          )}
        </button>
      </div>
    </form>
  );
}

