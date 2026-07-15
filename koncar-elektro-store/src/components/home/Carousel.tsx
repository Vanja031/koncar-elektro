import type { ReactNode } from 'react';
import { Children, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_AUTOPLAY_MS = 2000;

type CarouselProps = {
  children: ReactNode;
  className?: string;
  slideClassName?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  showDots?: boolean;
  /** Na mobilnom strelice uz ivicu ekrana (product carousel). */
  edgeArrowsOnMobile?: boolean;
  /** Na mobilnom manje strelice (npr. brendovi). */
  compactArrowsOnMobile?: boolean;
};

export const Carousel = ({
  children,
  className = '',
  slideClassName = '',
  autoplay = false,
  autoplayDelay = DEFAULT_AUTOPLAY_MS,
  showDots,
  edgeArrowsOnMobile = false,
  compactArrowsOnMobile = false,
}: CarouselProps) => {
  const slides = Children.toArray(children);
  const showDotNav = showDots ?? autoplay;
  const canLoop = autoplay && slides.length > 2;

  const autoplayRef = useRef(
    Autoplay({
      delay: autoplayDelay,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
    }),
  );

  useEffect(() => {
    autoplayRef.current.options.delay = autoplayDelay;
  }, [autoplayDelay]);

  const plugins = useMemo(() => (autoplay ? [autoplayRef.current] : []), [autoplay]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      loop: canLoop,
      dragFree: !autoplay,
      containScroll: canLoop ? false : 'trimSnaps',
      slidesToScroll: 1,
      duration: 22,
    },
    plugins,
  );

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const resetAutoplay = useCallback(() => {
    autoplayRef.current.reset();
  }, []);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    resetAutoplay();
  }, [emblaApi, resetAutoplay]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    resetAutoplay();
  }, [emblaApi, resetAutoplay]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      resetAutoplay();
    },
    [emblaApi, resetAutoplay],
  );

  const onInit = useCallback(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onInit();
    onSelect();
    emblaApi.on('reInit', onInit);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('reInit', onInit);
      emblaApi.off('reInit', onSelect);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  const useProgressBar = scrollSnaps.length > 8;
  const progress =
    scrollSnaps.length > 1 ? ((selectedIndex + 1) / scrollSnaps.length) * 100 : 100;

  const arrowIconClass = compactArrowsOnMobile
    ? 'w-4 h-4 sm:w-5 sm:h-5'
    : 'w-5 h-5';

  return (
    <div
      className={`home-carousel group ${edgeArrowsOnMobile ? 'home-carousel--edge-arrows' : ''} ${compactArrowsOnMobile ? 'home-carousel--compact-arrows' : ''} ${className}`}
    >
      <div className="relative">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canLoop && !canPrev}
          className="home-carousel-arrow home-carousel-arrow--prev"
          aria-label="Prethodno"
        >
          <ChevronLeft className={arrowIconClass} />
        </button>

        <div className="relative min-w-0">
          <div className="home-carousel-viewport" ref={emblaRef}>
            <div className="home-carousel-track">
              {slides.map((child, i) => (
                <div
                  key={(child as { key?: string | number }).key ?? i}
                  className={`home-carousel-slide ${slideClassName}`}
                >
                  {child}
                </div>
              ))}
            </div>
          </div>

          {autoplay ? (
            <>
              <div className="home-carousel-fade home-carousel-fade--left" aria-hidden />
              <div className="home-carousel-fade home-carousel-fade--right" aria-hidden />
            </>
          ) : null}
        </div>

        <button
          type="button"
          onClick={scrollNext}
          disabled={!canLoop && !canNext}
          className="home-carousel-arrow home-carousel-arrow--next"
          aria-label="Sledeće"
        >
          <ChevronRight className={arrowIconClass} />
        </button>
      </div>

      {showDotNav && scrollSnaps.length > 1 ? (
        useProgressBar ? (
          <div
            className="home-carousel-progress"
            role="progressbar"
            aria-valuenow={selectedIndex + 1}
            aria-valuemin={1}
            aria-valuemax={scrollSnaps.length}
            aria-label="Napredak karusela"
          >
            <div className="home-carousel-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        ) : (
          <div className="home-carousel-dots">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Pozicija ${i + 1}`}
                aria-current={i === selectedIndex ? 'true' : undefined}
                className={`home-carousel-dot ${i === selectedIndex ? 'home-carousel-dot--active' : ''}`}
              />
            ))}
          </div>
        )
      ) : null}
    </div>
  );
};
