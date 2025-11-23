import type { Product } from '../types';
import { formatPriceKRW } from '../utils/format';

type Props = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
};

export function ProductList({ products, onEdit, onDelete, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/50">
        등록된 상품이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>ID</th>
            <th>이미지</th>
            <th>상품명</th>
            <th>가격</th>
            <th>재고</th>
            <th>카테고리</th>
            <th>등록일</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>
                <img
                  src={product.imageUrl || '/placeholder.png'}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
              </td>
              <td>
                <div className="font-semibold">{product.name}</div>
                {product.description && (
                  <div className="text-sm text-base-content/70 line-clamp-1">
                    {product.description}
                  </div>
                )}
              </td>
              <td>{formatPriceKRW(product.price)}</td>
              <td>
                <span className={product.stock === 0 ? 'text-error' : ''}>
                  {product.stock}
                </span>
              </td>
              <td>
                <span className="badge badge-outline">
                  {product.categoryDisplayName}
                </span>
              </td>
              <td>
                {product.createdAt
                  ? new Date(product.createdAt).toLocaleDateString('ko-KR')
                  : '-'}
              </td>
              <td>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onEdit(product)}
                  >
                    수정
                  </button>
                  <button
                    className="btn btn-sm btn-error"
                    onClick={() => {
                      if (confirm(`"${product.name}" 상품을 삭제하시겠습니까?`)) {
                        onDelete(product.id);
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
  );
}

