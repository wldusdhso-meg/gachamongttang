import type { Product } from '../types';
import { Link } from 'react-router-dom';
import { formatPriceKRW } from '../utils/format';

type Props = {
  product: Product;
  onAddToCart?: (id: string) => void;
};

export function ProductCard({ product, onAddToCart }: Props) {
  return (
    <div className="card bg-base-100 shadow">
      <figure><img src={product.imageUrl} alt={product.name} className="h-48 w-full object-cover" /></figure>
      <div className="card-body">
        <h2 className="card-title"><Link to={`/products/${product.id}`}>{product.name}</Link></h2>
        <p className="text-sm text-base-content/70">{product.description}</p>
        <div className="font-semibold">{formatPriceKRW(product.price)}</div>
        {onAddToCart && (
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={() => onAddToCart(product.id)}>
              장바구니 담기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


