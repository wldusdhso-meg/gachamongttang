import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '../api/products';
import type { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export default function Search() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchProducts({ size: 100 }).then((response) => {
      setProducts(response.products);
    });
  }, []);

  const filtered = useMemo(() => products
    .filter(p => (category === 'all' || p.categoryName === category))
    .filter(p => p.name.toLowerCase().includes(query.toLowerCase() || '')),
  [products, query, category]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <label className="input input-bordered flex items-center gap-2 grow">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 111.06-1.06l2.755 2.754a.75.75 0 11-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0Z" clipRule="evenodd" /></svg>
          <input type="text" className="grow" placeholder="상품 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <select className="select select-bordered" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">전체</option>
          <option value="accessory">액세서리</option>
          <option value="stationery">문구</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="alert"><span>검색 결과가 없습니다.</span></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}



