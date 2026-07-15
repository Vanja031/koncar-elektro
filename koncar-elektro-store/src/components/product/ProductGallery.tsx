import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { ProductImageLightbox } from './ProductImageLightbox';

/** Product video thumb — enable when WC/video URL is wired */
const SHOW_PRODUCT_VIDEO_THUMB = false;

type Props = {
  images: string[];
  name: string;
  discount?: number;
};

export const ProductGallery = ({ images, name, discount }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1, align: 'start' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
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

  const goPrev = () => emblaApi?.scrollPrev();
  const goNext = () => emblaApi?.scrollNext();

  return (
    <div className="product-gallery">
      <div className="product-gallery-main">
        {discount != null && discount > 0 && (
          <span className="product-gallery-discount">-{discount}%</span>
        )}

        {images.length > 1 && (
          <>
            <button type="button" onClick={goPrev} className="product-gallery-arrow product-gallery-arrow--left" aria-label="Prethodna slika">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" onClick={goNext} className="product-gallery-arrow product-gallery-arrow--right" aria-label="Sledeća slika">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div className="product-gallery-viewport" ref={emblaRef}>
          <div className="product-gallery-track">
            {images.map((img, i) => (
              <div key={`${img}-${i}`} className="product-gallery-slide">
                <button
                  type="button"
                  className="product-gallery-image-wrap w-full"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Uvećaj sliku"
                >
                  <img src={img} alt={`${name} — slika ${i + 1}`} className="product-gallery-image" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <span className="product-gallery-zoom-hint">
          <ZoomIn className="w-4 h-4" />
        </span>
      </div>

      {lightboxOpen && (
        <ProductImageLightbox
          images={images}
          name={name}
          initialIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className="product-gallery-thumbs" role="tablist" aria-label="Slike proizvoda">
        {images.map((img, i) => (
          <button
            key={`${img}-${i}`}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Slika ${i + 1}`}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`product-gallery-thumb ${i === activeIndex ? 'product-gallery-thumb--active' : ''}`}
          >
            <img src={img} alt="" className="max-h-full max-w-full object-contain" />
          </button>
        ))}
        {SHOW_PRODUCT_VIDEO_THUMB && (
          <button type="button" className="product-gallery-thumb product-gallery-thumb--video" aria-label="Video proizvoda">
            <span className="text-[10px] font-semibold text-primary">Video</span>
          </button>
        )}
      </div>
    </div>
  );
};
