import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

type Props = {
  images: string[];
  name: string;
  discount?: number;
};

export const ProductGallery = ({ images, name, discount }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasVideo = images.length > 0;

  const goPrev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

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

        <div className="product-gallery-image-wrap">
          <img src={images[activeIndex]} alt={name} className="product-gallery-image" />
        </div>
      </div>

      <div className="product-gallery-thumbs koncar-scrollbar" role="tablist" aria-label="Slike proizvoda">
        {images.map((img, i) => (
          <button
            key={`${img}-${i}`}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Slika ${i + 1}`}
            onClick={() => setActiveIndex(i)}
            className={`product-gallery-thumb ${i === activeIndex ? 'product-gallery-thumb--active' : ''}`}
          >
            <img src={img} alt="" className="max-h-full max-w-full object-contain" />
          </button>
        ))}
        {hasVideo && (
          <button type="button" className="product-gallery-thumb product-gallery-thumb--video" aria-label="Video proizvoda">
            <Play className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-semibold text-primary mt-0.5">Video</span>
          </button>
        )}
      </div>
    </div>
  );
};
