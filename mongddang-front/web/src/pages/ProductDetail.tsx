import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '../api/products';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatPriceKRW } from '../utils/format';

const SHIPPING_FREE_THRESHOLD = 20000; // 무료 배송 기준 금액
const SHIPPING_COST = 3000; // 배송비
const REWARD_POINT_RATE = 0.03; // 적립금 비율 (3%)

// 임시 데이터
const PRODUCT_DETAIL_CONTENT = `상품 상세 정보가 여기에 표시됩니다.
이 상품은 고품질의 소재로 제작되었으며, 오래 사용할 수 있습니다.
상세한 제품 사양과 사용 방법이 포함되어 있습니다.`;

const SHOPPING_GUIDE = {
  결제안내: `무통장입금 주문 시 주문일로부터 12시간 이내 입금해주세요.
12시간 이내 입금이 되지 않으면 주문이 자동 취소됩니다.
주문자명과 입금자명이 다를 경우 입금 확인이 어려우니 고객센터로 알려주세요.
카카오 채널톡 또는 네이버 톡톡이 가장 빠른 답변이 가능합니다.

카드 결제는 부분 취소가 가능합니다.
하지만 휴대폰 결제는 시스템상 부분 취소가 불가능하니 양해 부탁드립니다.

휴대폰 결제 취소는 결제하신 당월에만 가능합니다.
결제하신 월이 지나면 취소가 불가능합니다.
휴대폰 결제 취소 시 휴대폰 결제 수수료와 부가세를 제외한 금액을 현금으로 환불해드립니다.`,
  배송안내: `배송은 주문 완료 후 1-2일 내에 발송됩니다.
배송비는 3,000원이며, 20,000원 이상 구매 시 무료배송입니다.
배송은 평일 기준으로 진행되며, 주말 및 공휴일에는 배송이 지연될 수 있습니다.
배송 추적은 주문 내역에서 확인하실 수 있습니다.`,
  '교환 및 반품안내': `상품 수령 후 7일 이내에 교환 및 반품이 가능합니다.
단, 고객님의 단순 변심으로 인한 교환/반품 시 배송비는 고객 부담입니다.
상품의 하자나 오배송의 경우 배송비는 판매자가 부담합니다.
교환 및 반품을 원하시면 고객센터로 연락해주세요.`
};

const REVIEW_COUNT = 38;

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | undefined>();
  const [qty, setQty] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'detail' | 'guide' | 'review'>('detail');
  const { addToCart } = useCart();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetchProductById(id)
        .then(setProduct)
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return product.price * qty;
  }, [product, qty]);

  const rewardPoints = useMemo(() => {
    return Math.floor(totalPrice * REWARD_POINT_RATE);
  }, [totalPrice]);

  const shippingCost = useMemo(() => {
    return totalPrice >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST;
  }, [totalPrice]);

  if (isLoading || !product) {
    return (
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
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* 상품 제목 */}
      <h1 className="text-2xl font-semibold mb-4">{product.name}</h1>
      
      <hr className="mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 상품 이미지 */}
        <div className="card bg-base-100 shadow">
          <figure>
            <img 
              src={product.imageUrl || '/placeholder.png'} 
              alt={product.name} 
              className="w-full object-cover" 
            />
          </figure>
        </div>

        {/* 상품 정보 */}
        <div className="space-y-4">
          {/* 판매가 */}
          <div>
            <div className="text-2xl font-bold text-pink-500 mb-4">
              {formatPriceKRW(product.price)}
            </div>
          </div>

          {/* 배송 정보 */}
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="w-24 text-base-content/70">배송방법</span>
              <span>택배</span>
            </div>
            <div className="flex">
              <span className="w-24 text-base-content/70">배송비</span>
              <span>
                {shippingCost === 0 ? (
                  <span className="text-primary">무료</span>
                ) : (
                  <>
                    {formatPriceKRW(SHIPPING_COST)} ({formatPriceKRW(SHIPPING_FREE_THRESHOLD)} 이상 구매 시 무료)
                  </>
                )}
              </span>
            </div>
            <div className="flex">
              <span className="w-24 text-base-content/70">적립금</span>
              <span>{formatPriceKRW(rewardPoints)} ({Math.floor(REWARD_POINT_RATE * 100)}%)</span>
            </div>
          </div>

          <hr className="my-4" />

          {/* 수량 선택 및 가격 */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-base font-medium mb-2">{product.name}</div>
            </div>
            <div className="join">
              <button 
                className="btn btn-sm join-item" 
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <input 
                className="input input-bordered input-sm w-16 text-center join-item" 
                value={qty} 
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} 
              />
              <button 
                className="btn btn-sm join-item" 
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatPriceKRW(product.price * qty)}</div>
              <div className="text-xs text-base-content/70">
                (적 {formatPriceKRW(rewardPoints)})
              </div>
            </div>
          </div>

          {/* 총 가격 */}
          <div className="flex justify-end pt-4 border-t">
            <div className="text-right">
              <div className="text-lg font-bold">
                총 가격 : {formatPriceKRW(totalPrice)} ({qty}개)
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button 
              className="btn btn-primary flex-1" 
              onClick={() => addToCart(product.id, qty)}
            >
              장바구니 담기
            </button>
            <button className="btn btn-outline flex-1">바로구매</button>
          </div>

          {/* 상품 설명 */}
          {product.description && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">상품 설명</h3>
              <p className="text-sm text-base-content/70 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mt-12 border-t pt-4">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setActiveTab('detail');
              scrollToSection('product-detail');
            }}
            className={`pb-2 px-2 ${
              activeTab === 'detail'
                ? 'text-black border-b-2 border-pink-300'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            상품상세정보
          </button>
          <button
            onClick={() => {
              setActiveTab('guide');
              scrollToSection('shopping-guide');
            }}
            className={`pb-2 px-2 ${
              activeTab === 'guide'
                ? 'text-black border-b-2 border-pink-300'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            쇼핑가이드
          </button>
          <button
            onClick={() => {
              setActiveTab('review');
              scrollToSection('product-review');
            }}
            className={`pb-2 px-2 ${
              activeTab === 'review'
                ? 'text-black border-b-2 border-pink-300'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            상품후기
            <span className="ml-2 bg-pink-100 text-black px-2 py-0.5 rounded text-xs">
              {REVIEW_COUNT}
            </span>
          </button>
        </div>
      </div>

      {/* 상품 상세 정보 */}
      <div id="product-detail" className="mt-8 pt-8">
        <h2 className="text-xl font-semibold mb-4">상품 상세 정보</h2>
        <div className="bg-base-100 p-6 rounded border">
          {product.detailDescription ? (
            <div 
              className="prose max-w-none prose-invert"
              dangerouslySetInnerHTML={{ __html: product.detailDescription }}
            />
          ) : (
            <p className="whitespace-pre-line text-sm leading-relaxed text-base-content">
              {PRODUCT_DETAIL_CONTENT}
            </p>
          )}
        </div>
      </div>

      {/* 쇼핑 가이드 */}
      <div id="shopping-guide" className="mt-8 pt-8">
        <h2 className="text-xl font-semibold mb-4">쇼핑 가이드</h2>
        <div className="bg-base-100 rounded border overflow-hidden">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-base-300">
                <td className="w-48 bg-base-200 p-4 font-medium border-r border-base-300 text-base-content">
                  결제안내
                </td>
                <td className="p-4 text-base-content">
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {SHOPPING_GUIDE.결제안내}
                  </p>
                </td>
              </tr>
              <tr className="border-b border-base-300">
                <td className="w-48 bg-base-200 p-4 font-medium border-r border-base-300 text-base-content">
                  배송안내
                </td>
                <td className="p-4 text-base-content">
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {SHOPPING_GUIDE.배송안내}
                  </p>
                </td>
              </tr>
              <tr>
                <td className="w-48 bg-base-200 p-4 font-medium border-r border-base-300 text-base-content">
                  교환 및 반품안내
                </td>
                <td className="p-4 text-base-content">
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {SHOPPING_GUIDE['교환 및 반품안내']}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 상품 후기 */}
      <div id="product-review" className="mt-8 pt-8 pb-12">
        <h2 className="text-xl font-semibold mb-4">상품 후기</h2>
        <div className="bg-base-100 p-6 rounded border text-center">
          <p className="text-gray-600 mb-4">상품 후기 페이지로 이동합니다.</p>
          <a 
            href="#product-review" 
            className="text-primary hover:underline"
            onClick={(e) => {
              e.preventDefault();
              // TODO: 상품 후기 페이지로 이동하는 링크 추가
              alert('상품 후기 페이지로 이동합니다.');
            }}
          >
            상품 후기 보기 ({REVIEW_COUNT}개)
          </a>
        </div>
      </div>
    </div>
  );
}
