import { useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { mockProducts } from '../api/mock';
import { formatPriceKRW } from '../utils/format';

export default function Cart() {
  const { items, removeFromCart, setQuantity } = useCart();
  const lines = useMemo(() => items.map((i) => ({
    item: i,
    product: mockProducts.find((p) => p.id === i.productId)!,
    subtotal: (mockProducts.find((p) => p.id === i.productId)!.price) * i.quantity,
  })), [items]);
  const total = lines.reduce((sum, l) => sum + l.subtotal, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">장바구니</h1>
      {lines.length === 0 ? (
        <div className="alert">
          <span>장바구니가 비었습니다.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {lines.map(({ item, product, subtotal }) => (
              <div key={item.productId} className="card bg-base-100 shadow">
                <div className="card-body">
                  <div className="flex items-center gap-4">
                    <img src={product.imageUrl} className="w-24 h-24 object-cover rounded" />
                    <div className="flex-1">
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-sm text-base-content/70">{formatPriceKRW(product.price)}</div>
                    </div>
                    <div className="join">
                      <button className="btn join-item" onClick={() => setQuantity(item.productId, Math.max(1, item.quantity - 1))}>-</button>
                      <input className="input input-bordered w-16 text-center join-item" value={item.quantity} onChange={(e) => setQuantity(item.productId, Math.max(1, Number(e.target.value) || 1))} />
                      <button className="btn join-item" onClick={() => setQuantity(item.productId, item.quantity + 1)}>+</button>
                    </div>
                    <div className="w-24 text-right font-semibold">{formatPriceKRW(subtotal)}</div>
                    <button className="btn btn-ghost" onClick={() => removeFromCart(item.productId)}>삭제</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card bg-base-100 shadow h-fit">
            <div className="card-body">
              <div className="flex justify-between">
                <span>합계</span>
                <span className="font-bold">{formatPriceKRW(total)}</span>
              </div>
              <button className="btn btn-primary mt-2">결제하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


