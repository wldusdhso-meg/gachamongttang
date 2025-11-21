import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '../api/products';
import type { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Carousel } from '../components/Carousel';

function chunk<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  const trending = useMemo(() => products.slice(0, 9), [products]);
  const newArrivals = useMemo(() => products.slice().reverse().slice(0, 9), [products]);

  const trendingSlides = useMemo(() => chunk(trending, 3), [trending]);
  const newSlides = useMemo(() => chunk(newArrivals, 3), [newArrivals]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl font-semibold">지금 뜨는</h2>
        </div>
        <Carousel
          className="w-full"
          slides={trendingSlides.map((slide, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {slide.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ))}
        />
      </section>

      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl font-semibold">신상</h2>
        </div>
        <Carousel
          className="w-full"
          slides={newSlides.map((slide, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {slide.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ))}
        />
      </section>
    </div>
  );
}


