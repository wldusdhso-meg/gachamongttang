type Banner = {
  src: string;
  alt: string;
};

const banners: Banner[] = [
  { src: '/banner1.jpg', alt: 'promo 1' },
];

export function BannerSlider() {
  return (
    <div className="w-full">
      {banners.length > 0 ? (
        <div className="carousel w-full rounded-xl shadow h-64 md:h-80 lg:h-96 bg-base-200">
          {banners.map((b, idx) => (
            <div id={`slide${idx}`} key={idx} className="carousel-item relative w-full justify-center items-center">
              <img
                src={b.src}
                alt={b.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 이미지 로드 실패 시 숨김 처리
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              {banners.length > 1 && (
                <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                  <a href={`#slide${(idx - 1 + banners.length) % banners.length}`} className="btn btn-circle">❮</a>
                  <a href={`#slide${(idx + 1) % banners.length}`} className="btn btn-circle">❯</a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full rounded-xl shadow h-64 md:h-80 lg:h-96 bg-base-200 flex items-center justify-center">
          <p className="text-base-content/50">배너 이미지를 준비 중입니다.</p>
        </div>
      )}
    </div>
  );
}



