import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import type { HeroSlide } from '@/data/homeHero';
import { contactChannels } from '@/data/staticPages';

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;

type Props = {
  slides: HeroSlide[];
  layout?: 'desktop' | 'mobile';
};

export const HeroCarousel = ({ slides, layout = 'desktop' }: Props) => {
  const [index, setIndex] = useState(0);
  const [autoplayEpoch, setAutoplayEpoch] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const goTo = useCallback(
    (next: number) => setIndex((next + slides.length) % slides.length),
    [slides.length],
  );

  const goToManual = useCallback(
    (next: number) => {
      goTo(next);
      setAutoplayEpoch((e) => e + 1);
    },
    [goTo],
  );

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [slides.length, autoplayEpoch]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (layout !== 'mobile') return;
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (layout !== 'mobile' || !touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;
    goToManual(index + (dx < 0 ? 1 : -1));
  };

  const slide = slides[index];
  const isMobile = layout === 'mobile';

  return (
    <div
      className={`relative overflow-hidden group ${
        isMobile
          ? 'w-full min-h-[300px] aspect-[1.28/1] max-h-[380px] rounded-none sm:rounded'
          : 'aspect-[2.14/1] w-full rounded'
      }`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((s, i) => (
        <img
          key={s.image}
          src={s.image}
          alt=""
          draggable={false}
          className={`absolute inset-0 w-full h-full object-cover select-none transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div
        className={`absolute inset-0 ${
          slide.variant === 'dark'
            ? isMobile
              ? 'bg-gradient-to-t from-navy-dark/95 via-navy-dark/80 to-navy-dark/55'
              : 'bg-gradient-to-r from-navy-dark/92 via-navy-dark/75 to-navy-dark/35'
            : isMobile
              ? 'bg-gradient-to-t from-navy-dark/92 via-navy-dark/75 to-navy-dark/50'
              : 'bg-gradient-to-r from-navy-dark/88 via-navy-dark/65 to-transparent'
        }`}
      />
      <div
        className={
          isMobile
            ? 'relative h-full flex flex-col items-center justify-center text-center px-10 pt-4 pb-10'
            : 'relative h-full flex flex-col justify-center px-6 md:px-8 max-w-md'
        }
      >
        <div className={isMobile ? 'max-w-[92%]' : undefined}>
        <span
          className={`text-white/60 font-bold uppercase tracking-[0.2em] mb-1.5 block ${
            isMobile ? 'text-[10px]' : 'text-[10px]'
          }`}
        >
          {slide.brand}
        </span>
        <h2
          className={`font-display font-bold text-white uppercase leading-tight mb-1.5 ${
            isMobile ? 'text-lg leading-snug' : 'text-xl md:text-2xl'
          }`}
        >
          {slide.title}
        </h2>
        <p
          className={`text-white/75 ${
            isMobile ? 'text-xs leading-snug line-clamp-2 mb-3' : 'text-xs md:text-sm line-clamp-2 mb-4'
          }`}
        >
          {slide.desc}
        </p>
        {slide.cta === 'expert' ? (
          <a
            href={contactChannels.primaryPhoneHref}
            className={`btn-yellow inline-flex items-center gap-1 ${
              isMobile ? 'text-[10px] py-1.5 px-2.5' : 'text-[11px] py-2 px-3'
            }`}
          >
            <Phone className="w-3 h-3 shrink-0" /> {contactChannels.primaryPhone}
          </a>
        ) : (
          <div className={isMobile ? 'flex justify-center' : undefined}>
          <a
            href="#"
            className={`btn-outline-white w-fit ${isMobile ? 'text-[10px] py-1.5 px-3' : 'text-[11px]'}`}
          >
            Saznajte više →
          </a>
          </div>
        )}
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToManual(i)}
            aria-label={`Slajd ${i + 1}`}
            className={`h-1 rounded-full transition-all ${
              i === index ? (isMobile ? 'w-4 bg-accent' : 'w-5 bg-accent') : 'w-1 bg-white/40'
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => goToManual(index - 1)}
        className={`absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 text-white flex items-center justify-center transition-opacity hover:bg-white/25 ${
          isMobile
            ? 'w-7 h-7 opacity-100'
            : 'w-7 h-7 opacity-0 group-hover:opacity-100'
        }`}
        aria-label="Prethodni slajd"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => goToManual(index + 1)}
        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 text-white flex items-center justify-center transition-opacity hover:bg-white/25 ${
          isMobile
            ? 'w-7 h-7 opacity-100'
            : 'w-7 h-7 opacity-0 group-hover:opacity-100'
        }`}
        aria-label="Sledeći slajd"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
