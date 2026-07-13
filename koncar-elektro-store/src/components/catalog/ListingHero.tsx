import { Breadcrumbs } from './Breadcrumbs';
import type { BreadcrumbItem } from '@/data/categoryPages';
import breadcrumbsHero from '@/assets/breadcrumbs.png';

type Props = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  /** Short copy under the yellow accent line. */
  description?: string;
};

/** Shared catalog hero — always brand breadcrumbs image + title accent line. */
export const ListingHero = ({ breadcrumbs, title, description }: Props) => (
  <section className="relative overflow-hidden min-h-[11rem] md:min-h-[13rem] flex items-end">
    <img
      src={breadcrumbsHero}
      alt=""
      className="absolute inset-0 w-full h-full object-cover object-right"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/25" />
    <div className="container relative z-10 py-6 md:py-8">
      <Breadcrumbs items={breadcrumbs} variant="hero" />
      <h1 className="title-accent-line font-display font-bold text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-wide mt-3 mb-0 max-w-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3.5 text-sm md:text-base text-white/90 max-w-2xl leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  </section>
);
