import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { SocialIcon } from './SocialIcon';
import type { HeroSlide } from '@/data/homeHero';

type Props = {
  slides: HeroSlide[];
};

export const HeroCarousel = ({ slides }: Props) => {
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (next: number) => setIndex((next + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const slide = slides[index];

  return (
    <div className="relative h-[280px] md:h-[300px] rounded overflow-hidden group">
      {slides.map((s, i) => (
        <img
          key={s.image}
          src={s.image}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div
        className={`absolute inset-0 ${
          slide.variant === 'dark'
            ? 'bg-gradient-to-r from-navy-dark/92 via-navy-dark/75 to-navy-dark/35'
            : 'bg-gradient-to-r from-navy-dark/88 via-navy-dark/65 to-transparent'
        }`}
      />
      <div className="relative h-full flex flex-col justify-center px-6 md:px-8 max-w-md">
        <span className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{slide.brand}</span>
        <h2 className="font-display font-bold text-xl md:text-2xl text-white uppercase leading-tight mb-2">{slide.title}</h2>
        <p className="text-white/75 text-xs md:text-sm mb-4 line-clamp-2">{slide.desc}</p>
        {slide.cta === 'expert' ? (
          <div className="flex flex-wrap gap-2">
            <a href="tel:0111234567" className="btn-yellow text-[11px] flex items-center gap-1.5 py-2 px-3">
              <Phone className="w-3.5 h-3.5" /> 011 123 4567
            </a>
            <a href="#" className="bg-viber text-white font-display font-semibold uppercase text-[11px] px-3 py-2 rounded flex items-center gap-1.5 hover:brightness-110 transition-all">
              <SocialIcon name="viber" className="w-5 h-5" alt="" />
              Viber chat
            </a>
          </div>
        ) : (
          <a href="#" className="btn-outline-white text-[11px] w-fit">Saznajte više →</a>
        )}
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Slajd ${i + 1}`}
            className={`h-1 rounded-full transition-all ${i === index ? 'w-5 bg-accent' : 'w-1 bg-white/40'}`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/25"
        aria-label="Prethodni slajd"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/25"
        aria-label="Sledeći slajd"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
