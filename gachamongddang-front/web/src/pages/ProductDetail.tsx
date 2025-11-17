import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '../api/products';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatPriceKRW } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | undefined>();
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) fetchProductById(id).then(setProduct);
  }, [id]);

  if (!product) return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="skeleton h-6 w-40 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="skeleton h-80 w-full" />
        <div className="space-y-3">
          <div className="skeleton h-6 w-1/2" />
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-10 w-40" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card bg-base-100 shadow">
          <figure><img src={product.imageUrl} alt={product.name} className="w-full object-cover" /></figure>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-base-content/70">{product.description}</p>
          <div className="text-2xl font-extrabold">{formatPriceKRW(product.price)}</div>

          <div className="join">
            <button className="btn join-item" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
            <input className="input input-bordered w-16 text-center join-item" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
            <button className="btn join-item" onClick={() => setQty((q) => q + 1)}>+</button>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="btn btn-primary" onClick={() => addToCart(product.id, qty)}>장바구니 담기</button>
            <button className="btn btn-outline">바로구매</button>
          </div>
        </div>
      </div>
    </div>
  );
}


