import { Breadcrumbs } from './Breadcrumbs';
import type { BreadcrumbItem } from '@/data/categoryPages';
import breadcrumbsHero from '@/assets/breadcrumbs.png';

type Props = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
};

export const ListingHero = ({ breadcrumbs, title }: Props) => (
  <section className="relative overflow-hidden min-h-[10rem] md:min-h-[11rem] flex items-end">
    <img
      src={breadcrumbsHero}
      alt=""
      className="absolute inset-0 w-full h-full object-cover object-right"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/20" />
    <div className="container relative z-10 py-6 md:py-7">
      <Breadcrumbs items={breadcrumbs} variant="hero" />
      <h1 className="font-display font-bold text-3xl md:text-4xl text-white uppercase tracking-wide mt-3">
        {title}
      </h1>
    </div>
  </section>
);
