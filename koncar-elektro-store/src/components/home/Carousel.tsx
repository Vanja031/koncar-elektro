import type { ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type CarouselProps = {
  children: ReactNode;
  className?: string;
  slideClassName?: string;
};

export const Carousel = ({ children, className = '', slideClassName = '' }: CarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', dragFree: true, containScroll: 'trimSnaps' });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={`relative group ${className}`}>
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canPrev}
        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-border shadow-md items-center justify-center text-primary disabled:opacity-30 hover:bg-secondary transition-colors -ml-3"
        aria-label="Prethodno"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {Array.isArray(children)
            ? children.map((child, i) => (
                <div key={i} className={`min-w-0 shrink-0 grow-0 basis-[calc(50%-8px)] sm:basis-[calc(33.333%-11px)] lg:basis-[calc(16.666%-14px)] ${slideClassName}`}>
                  {child}
                </div>
              ))
            : children}
        </div>
      </div>
      <button
        type="button"
        onClick={scrollNext}
        disabled={!canNext}
        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-border shadow-md items-center justify-center text-primary disabled:opacity-30 hover:bg-secondary transition-colors -mr-3"
        aria-label="Sledeće"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
