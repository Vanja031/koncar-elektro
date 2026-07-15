import koncarLogo from '@/assets/koncar.png';
import { cn } from '@/lib/utils';

const heightClass = {
  xs: 'h-6',
  sm: 'h-8',
  md: 'h-11',
  lg: 'h-14',
} as const;

type BrandLogoProps = {
  className?: string;
  height?: keyof typeof heightClass;
};

export const BrandLogo = ({
  className,
  height,
}: BrandLogoProps) => (
  <img
    src={koncarLogo}
    alt="Končar Elektro"
    className={cn(
      height && heightClass[height],
      'w-auto object-contain object-left',
      className,
    )}
  />
);
