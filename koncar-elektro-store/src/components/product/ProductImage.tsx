import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Extra class on the gray placeholder box */
  placeholderClassName?: string;
  loading?: 'lazy' | 'eager';
};

/** True when WC/catalog actually gave a usable image URL. */
export function hasProductImage(src?: string | null): boolean {
  return Boolean(src?.trim());
}

/**
 * Product media with a zero-network gray placeholder when image is missing/broken.
 * Placeholder is pure CSS + lucide icon (already in the bundle) — no extra HTTP.
 */
export function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  placeholderClassName,
  loading = 'lazy',
}: Props) {
  const initial = hasProductImage(src) ? src!.trim() : '';
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !initial || failed;

  if (showPlaceholder) {
    return (
      <span
        className={cn('product-image-placeholder', className, placeholderClassName)}
        role="img"
        aria-label={alt ? `${alt} — nema slike` : 'Nema slike proizvoda'}
      >
        <ImageIcon className="product-image-placeholder-icon" aria-hidden />
      </span>
    );
  }

  return (
    <img
      src={initial}
      alt={alt}
      loading={loading}
      className={cn(className, imgClassName)}
      onError={() => setFailed(true)}
    />
  );
}
