import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Complete from './pages/Complete';
import Health from './pages/Health';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartProvider } from './context/CartContext';
import Ranking from './pages/Ranking';
import Notices from './pages/Notices';
import MyPage from './pages/MyPage';
import Wishlist from './pages/Wishlist';
import Gacha from './pages/Gacha';
import { BannerSlider } from './components/BannerSlider';
import Search from './pages/Search';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import { Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-full flex flex-col">
          <Navbar />
          <main className="flex-1">
            <div className="mx-auto max-w-6xl w-full px-4 pt-2">
              <BannerSlider />
            </div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/gacha" element={<Gacha />} />
              <Route path="/search" element={<Search />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/notices" element={<Notices />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/complete" element={<Complete />} />
              <Route path="/health" element={<Health />} />
              {/* 어드민 라우팅 */}
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/*" element={<Navigate to="/admin/products" replace />} />
              <Route path="*" element={<div className="mx-auto max-w-5xl px-4 py-6">Not Found. <Link to="/" className="underline">Go Home</Link></div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App
