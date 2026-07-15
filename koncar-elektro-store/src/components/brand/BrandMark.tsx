import { cn } from '@/lib/utils';
import { getBrandLogoSrc } from '@/lib/brandLogos';

const sizeClass = {
  xs: 'h-4 max-w-[4.5rem]',
  sm: 'h-5 max-w-[5.5rem]',
  md: 'h-7 max-w-[7rem]',
  lg: 'h-10 max-w-[9rem]',
  xl: 'h-12 max-w-[11rem]',
} as const;

type BrandMarkProps = {
  brand: string;
  className?: string;
  imgClassName?: string;
  size?: keyof typeof sizeClass;
  /** Show brand name text when logo is missing */
  fallbackToName?: boolean;
};

/** Manufacturer logo image, or optional text fallback. */
export const BrandMark = ({
  brand,
  className,
  imgClassName,
  size = 'sm',
  fallbackToName = true,
}: BrandMarkProps) => {
  const src = getBrandLogoSrc(brand);

  if (!src) {
    if (!fallbackToName) return null;
    return (
      <span className={cn('font-display font-bold uppercase tracking-wide text-primary text-xs', className)}>
        {brand}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={brand}
      title={brand}
      loading="lazy"
      className={cn(
        'w-auto object-contain object-left',
        sizeClass[size],
        imgClassName,
        className,
      )}
    />
  );
};

type ManufacturerRowProps = {
  brand: string;
  className?: string;
  size?: keyof typeof sizeClass;
  label?: string;
};

/** "Proizvođač" label + logo (or name fallback). */
export const ManufacturerRow = ({
  brand,
  className,
  size = 'sm',
  label = 'Proizvođač',
}: ManufacturerRowProps) => {
  if (!brand?.trim()) return null;

  return (
    <div className={cn('flex items-center gap-2 min-w-0', className)}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
        {label}
      </span>
      <BrandMark brand={brand} size={size} className="shrink min-w-0" />
    </div>
  );
};
