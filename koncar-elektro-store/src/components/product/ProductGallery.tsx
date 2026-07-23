import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { ProductImage, hasProductImage } from './ProductImage';
import { ProductImageLightbox } from './ProductImageLightbox';

/** Product video thumb — enable when WC/video URL is wired */
const SHOW_PRODUCT_VIDEO_THUMB = false;

type Props = {
  images: string[];
  name: string;
  discount?: number;
};

export const ProductGallery = ({ images, name, discount }: Props) => {
  const galleryImages = images.filter(hasProductImage);
  const hasRealImages = galleryImages.length > 0;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: galleryImages.length > 1,
    align: 'start',
  });
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

        {galleryImages.length > 1 && (
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
            {(hasRealImages ? galleryImages : ['']).map((img, i) => (
              <div key={`${img || 'placeholder'}-${i}`} className="product-gallery-slide">
                {hasRealImages ? (
                  <button
                    type="button"
                    className="product-gallery-image-wrap w-full"
                    onClick={() => setLightboxOpen(true)}
                    aria-label="Uvećaj sliku"
                  >
                    <ProductImage src={img} alt={`${name} — slika ${i + 1}`} className="product-gallery-image" />
                  </button>
                ) : (
                  <div className="product-gallery-image-wrap w-full">
                    <ProductImage src="" alt={name} className="product-gallery-image" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {hasRealImages && (
          <span className="product-gallery-zoom-hint">
            <ZoomIn className="w-4 h-4" />
          </span>
        )}
      </div>

      {lightboxOpen && hasRealImages && (
        <ProductImageLightbox
          images={galleryImages}
          name={name}
          initialIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className="product-gallery-thumbs" role="tablist" aria-label="Slike proizvoda">
        {(hasRealImages ? galleryImages : ['']).map((img, i) => (
          <button
            key={`${img || 'placeholder'}-${i}`}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={hasRealImages ? `Slika ${i + 1}` : 'Nema slike'}
            onClick={() => hasRealImages && emblaApi?.scrollTo(i)}
            className={`product-gallery-thumb ${i === activeIndex ? 'product-gallery-thumb--active' : ''}`}
          >
            <ProductImage src={img} alt="" className="max-h-full max-w-full object-contain" />
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
