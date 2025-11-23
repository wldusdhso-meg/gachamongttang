import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const { items } = useCart();
  const location = useLocation();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div className="bg-base-100 border-b">
      <div className="mx-auto max-w-6xl w-full px-4 py-4">
        {/* 하나의 컨테이너 안에 아이콘들과 썸네일을 동일한 위계에 배치 */}
        <div className="flex items-center">
          {/* 왼쪽 아이콘들 */}
          <div className="flex gap-2 flex-1">
            <div className="dropdown dropdown-bottom">
              <button 
                className="btn btn-ghost btn-circle" 
                aria-label="menu"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              {isMenuOpen && (
                <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300 mt-2">
                  <li>
                    <Link to="/products" onClick={() => setIsMenuOpen(false)}>
                      소품
                    </Link>
                  </li>
                  <li>
                    <Link to="/gacha" onClick={() => setIsMenuOpen(false)}>
                      가챠
                    </Link>
                  </li>
                  <li>
                    <Link to="/notices" onClick={() => setIsMenuOpen(false)}>
                      공지사항
                    </Link>
                  </li>
                  <li><hr className="my-1" /></li>
                  <li>
                    <Link to="/admin/products" onClick={() => setIsMenuOpen(false)}>
                      상품관리
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/categories" onClick={() => setIsMenuOpen(false)}>
                      카테고리관리
                    </Link>
                  </li>
                </ul>
              )}
            </div>
            <Link to="/search" className="btn btn-ghost btn-circle" aria-label="search">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"/></svg>
            </Link>
          </div>
          
          {/* 중앙 썸네일 - 절대 중앙 정렬 */}
          <div className="flex justify-center flex-1">
            <Link to="/" className="flex items-center">
              <img 
                src="/thumbnail_text.png" 
                alt="가챠몽땅" 
                className="h-10 md:h-12 w-auto object-contain"
                onError={(e) => {
                  // 폴백: 이미지 로드 실패 시 텍스트로 대체
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const parent = (e.currentTarget as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-xl md:text-2xl font-extrabold tracking-wide">가챠몽땅</span>';
                  }
                }}
              />
            </Link>
          </div>
          
          {/* 오른쪽 아이콘들 */}
          <div className="flex gap-2 flex-1 justify-end">
            <Link to="/mypage" className="btn btn-ghost btn-circle" aria-label="my page">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </Link>
            <Link to="/cart" className="btn btn-ghost btn-circle indicator" aria-label="cart">
              <span className="indicator-item badge badge-primary">{count}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 22a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/></svg>
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl w-full px-4 pb-2">
        <div className="flex justify-center">
          <div className="flex w-full max-w-md">
            <Link 
              to="/products" 
              className={`flex-1 text-center py-2 px-4 border-b-2 transition-colors ${
                location.pathname.startsWith('/products') 
                  ? 'border-primary text-primary font-semibold' 
                  : 'border-base-300 text-base-content hover:border-base-content'
              }`}
            >
              소품
            </Link>
            <Link 
              to="/gacha" 
              className={`flex-1 text-center py-2 px-4 border-b-2 transition-colors ${
                location.pathname.startsWith('/gacha') 
                  ? 'border-primary text-primary font-semibold' 
                  : 'border-base-300 text-base-content hover:border-base-content'
              }`}
            >
              가챠
            </Link>
            <Link 
              to="/notices" 
              className={`flex-1 text-center py-2 px-4 border-b-2 transition-colors ${
                location.pathname.startsWith('/notices') 
                  ? 'border-primary text-primary font-semibold' 
                  : 'border-base-300 text-base-content hover:border-base-content'
              }`}
            >
              공지사항
            </Link>
          </div>
        </div>
      </div>
      {/* 메뉴가 열려있을 때 배경 클릭으로 닫기 */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}


