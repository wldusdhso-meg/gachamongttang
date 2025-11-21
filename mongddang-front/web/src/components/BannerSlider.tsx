type Banner = {
  src: string;
  alt: string;
};

const banners: Banner[] = [
  { src: '/banner1.jpg', alt: 'promo 1' },
  { src: 'https://picsum.photos/seed/banner-2/1600/500', alt: 'promo 2' },
  { src: 'https://picsum.photos/seed/banner-3/1600/500', alt: 'promo 3' },
];

export function BannerSlider() {
  return (
    <div className="w-full">
      <div className="carousel w-full rounded-xl shadow h-64 md:h-80 lg:h-96 bg-base-200">
        {banners.map((b, idx) => (
          <div id={`slide${idx}`} key={idx} className="carousel-item relative w-full justify-center items-center">
            <img
              src={b.src}
              alt={b.alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                // fallback if banner1.jpg isn't present yet
                (e.currentTarget as HTMLImageElement).src = `https://picsum.photos/seed/fallback-${idx}/1600/500`;
              }}
            />
            <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
              <a href={`#slide${(idx - 1 + banners.length) % banners.length}`} className="btn btn-circle">❮</a>
              <a href={`#slide${(idx + 1) % banners.length}`} className="btn btn-circle">❯</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



