import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  slides: ReactNode[];
  className?: string;
};

export function Carousel({ slides, className }: Props) {
  const [index, setIndex] = useState(0);
  const clamp = useCallback((i: number) => {
    if (i < 0) return slides.length - 1;
    if (i >= slides.length) return 0;
    return i;
  }, [slides.length]);

  const goPrev = useCallback(() => setIndex((i) => clamp(i - 1)), [clamp]);
  const goNext = useCallback(() => setIndex((i) => clamp(i + 1)), [clamp]);

  // touch / mouse drag
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current || startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    if (Math.abs(dx) > 60) {
      dragging.current = false;
      dx > 0 ? goPrev() : goNext();
    }
  };
  const onTouchEnd = () => {
    dragging.current = false;
    startX.current = null;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    dragging.current = true;
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!dragging.current || startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 80) {
      dragging.current = false;
      dx > 0 ? goPrev() : goNext();
    }
  };
  const onMouseUp = () => {
    dragging.current = false;
    startX.current = null;
  };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className={className}>
      <div
        className="relative w-full select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
      >
        <div className="overflow-hidden rounded-xl bg-base-200">
          <div
            className="flex transition-transform duration-300"
            style={{ transform: `translateX(-${index * 100}%)`, width: `${slides.length * 100}%` }}
          >
            {slides.map((slide, i) => (
              <div key={i} className="w-full shrink-0 px-4 py-4">
                {slide}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <button className="btn btn-circle" onClick={goPrev}>❮</button>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button className="btn btn-circle" onClick={goNext}>❯</button>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`btn btn-xs rounded-full ${i === index ? 'btn-primary' : ''}`}
            aria-label={`go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}



