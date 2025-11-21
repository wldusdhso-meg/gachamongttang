export default function Notices() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">공지사항</h1>
      <ul className="space-y-3">
        {[1,2,3].map((i) => (
          <li key={i} className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title">공지 {i}</h3>
              <p className="text-sm text-base-content/70">공지 내용 예시입니다.</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}



