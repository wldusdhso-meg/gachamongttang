export default function MyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">마이페이지</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">주문 내역</h2>
            <p className="text-sm text-base-content/70">최근 주문이 없습니다.</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">쿠폰/포인트</h2>
            <p className="text-sm text-base-content/70">보유 쿠폰 0, 포인트 0</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">프로필</h2>
            <button className="btn">프로필 수정</button>
          </div>
        </div>
      </div>
    </div>
  );
}



