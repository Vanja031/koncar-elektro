import type { ReactNode } from 'react';
import { ShopLayout } from '@/components/layout/ShopLayout';
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import type { BreadcrumbItem } from '@/data/categoryPages';
import breadcrumbsHero from '@/assets/breadcrumbs.png';

type Props = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export const InfoPageShell = ({ breadcrumbs, title, subtitle, children }: Props) => (
  <ShopLayout>
    <section className="relative overflow-hidden min-h-[10rem] md:min-h-[12rem] flex items-end">
      <img
        src={breadcrumbsHero}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-right"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/20" />
      <div className="container relative z-10 py-6 md:py-8">
        <Breadcrumbs items={breadcrumbs} variant="hero" />
        <h1 className="font-display font-bold text-3xl md:text-4xl text-white uppercase tracking-wide mt-3 mb-1">
          {title}
        </h1>
        {subtitle && (
          <p className="text-accent font-display font-bold text-sm md:text-base max-w-2xl mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </section>

    <div className="container py-8 md:py-12">{children}</div>
  </ShopLayout>
);
