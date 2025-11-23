import type { Product } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { formatPriceKRW } from '../utils/format';

type Props = {
  product: Product;
  onAddToCart?: (id: string) => void;
};

export function ProductCard({ product, onAddToCart }: Props) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  return (
    <div 
      className="card bg-base-100 shadow cursor-pointer hover:shadow-lg transition-shadow" 
      onClick={handleCardClick}
    >
      <figure>
        <img 
          src={product.imageUrl || '/placeholder.png'} 
          alt={product.name} 
          className="h-48 w-full object-cover" 
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">
          <Link 
            to={`/products/${product.id}`} 
            onClick={(e) => e.stopPropagation()}
            className="hover:text-primary"
          >
            {product.name}
          </Link>
        </h2>
        <p className="text-sm text-base-content/70 line-clamp-2">{product.description || ''}</p>
        <div className="font-semibold">{formatPriceKRW(product.price)}</div>
        {onAddToCart && (
          <div className="card-actions justify-end">
            <button 
              className="btn btn-primary" 
              onClick={handleAddToCartClick}
            >
              장바구니 담기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


