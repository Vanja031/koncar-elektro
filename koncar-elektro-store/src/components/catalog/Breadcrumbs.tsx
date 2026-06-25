import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BreadcrumbItem } from '@/data/categoryPages';

type Props = {
  items: BreadcrumbItem[];
  variant?: 'hero' | 'bar';
};

export const Breadcrumbs = ({ items, variant = 'bar' }: Props) => {
  const trail = (
    <ol className={`flex flex-wrap items-center gap-1.5 text-sm ${variant === 'hero' ? 'text-white/75' : 'text-muted-foreground'}`}>
      {items.map((item, i) => (
        <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />}
          {item.href ? (
            <Link to={item.href} className={`hover:underline ${variant === 'hero' ? 'hover:text-white' : 'hover:text-primary'}`}>
              {item.label}
            </Link>
          ) : (
            <span className={variant === 'hero' ? 'text-white' : 'text-foreground font-medium'}>{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  );

  if (variant === 'bar') {
    return (
      <div className="border-b border-border bg-secondary/30">
        <div className="container py-2">{trail}</div>
      </div>
    );
  }

  return trail;
};
