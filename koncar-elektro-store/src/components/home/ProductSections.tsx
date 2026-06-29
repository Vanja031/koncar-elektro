import { Star, Flame, ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saleProducts, bestSellerProducts, featuredBrands, whyChooseItems, categoryBanners } from '@/data/homepage';
import { brand } from '@/data/staticPages';
import { getTopCategoryUrl } from '@/lib/catalogUrls';
import { Carousel } from './Carousel';
import { ProductCard } from './ProductCard';
import { GoogleReviews } from './GoogleReviews';
import { FaqAccordion } from './FaqAccordion';
import agentAvatar from '@/assets/agent-avatar.png';

const bannerUrls: Record<string, string> = {
  Elektromaterijal: getTopCategoryUrl('elektromaterijal'),
  Rasveta: getTopCategoryUrl('rasveta'),
  'Solarne elektrane': getTopCategoryUrl('solarne'),
};

export const ProductSections = () => (
  <>
    <section className="container py-6">
      <div className="section-header">
        <h2 className="section-heading flex items-center gap-2">
          <Flame className="w-5 h-5 fill-accent text-accent shrink-0" /> Proizvodi na akciji
        </h2>
        <Link to="/akcija" className="section-link">Pogledajte sve akcije <ChevronRight className="w-4 h-4 shrink-0" /></Link>
      </div>
      <Carousel>
        {saleProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </Carousel>
    </section>

    <section className="container py-6">
      <div className="section-header">
        <h2 className="section-heading flex items-center gap-2">
          <Star className="w-5 h-5 fill-accent text-accent shrink-0" /> Najprodavaniji proizvodi
        </h2>
        <a href="#" className="section-link">Pogledajte sve najprodavanije <ChevronRight className="w-4 h-4 shrink-0" /></a>
      </div>
      <Carousel>
        {bestSellerProducts.map((p, i) => (
          <ProductCard key={p.id} product={p} rank={i + 1} />
        ))}
      </Carousel>
    </section>

    <section className="bg-primary text-white py-10 lg:py-12 mt-4 relative overflow-hidden">
      <div className="container relative z-10">
        <div className="trust-section-grid grid grid-cols-1 lg:grid-cols-3 lg:max-w-[75%] xl:max-w-[72%] lg:divide-x lg:divide-white/15">
          <div className="py-2 lg:py-0 lg:pr-8 border-b border-white/15 lg:border-b-0 pb-8 lg:pb-0 mb-8 lg:mb-0">
            <h3 className="section-heading-light">
              {brand.whyChooseTitle}
            </h3>
            <ul className="space-y-3.5">
              {whyChooseItems.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-white/90 leading-snug">
                  <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-accent-foreground" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="py-2 lg:py-0 lg:px-8 border-b border-white/15 lg:border-b-0 pb-8 lg:pb-0 mb-8 lg:mb-0">
            <h3 className="section-heading-light">
              Ocene kupaca
            </h3>
            <GoogleReviews />
          </div>

          <div className="py-2 lg:py-0 lg:pl-8">
            <h3 className="section-heading-light">
              Često postavljana pitanja
            </h3>
            <FaqAccordion />
          </div>
        </div>
      </div>

      <img
        src={agentAvatar}
        alt="Stručna podrška"
        className="hidden lg:block absolute right-0 bottom-0 h-[108%] max-w-[min(32vw,420px)] object-contain object-bottom pointer-events-none select-none"
      />
    </section>

    <section className="container py-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      {categoryBanners.map((b) => (
        <Link
          key={b.title}
          to={bannerUrls[b.title] ?? getTopCategoryUrl('alati')}
          className={`relative rounded-lg overflow-hidden min-h-[9.5rem] flex items-stretch group ${b.className}`}
        >
          <div className="relative z-10 flex-1 p-5 flex flex-col justify-center max-w-[58%]">
            <h3 className="font-display font-bold text-white uppercase text-base sm:text-lg mb-1.5 leading-tight">
              {b.title}
            </h3>
            <p className="text-xs text-white/85 leading-snug mb-3">{b.desc}</p>
            <span className="btn-outline-white text-[11px] sm:text-xs inline-flex items-center gap-1 w-fit">
              Pogledajte ponudu <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <img
            src={b.image}
            alt=""
            className="absolute right-1 bottom-0 h-[108%] max-w-[48%] object-contain object-bottom pointer-events-none group-hover:scale-[1.03] transition-transform"
            loading="lazy"
          />
        </Link>
      ))}
    </section>

    <section className="container py-6">
      <h2 className="section-heading mb-4">Istaknuti brendovi</h2>
      <Carousel slideClassName="!basis-[calc(25%-12px)] sm:!basis-[calc(20%-13px)] md:!basis-[calc(12.5%-14px)]">
        {featuredBrands.map((b) => (
          <a
            key={b}
            href="#"
            className="h-16 border border-border rounded bg-white flex items-center justify-center px-4 hover:border-primary/30 hover:shadow-card transition-all"
          >
            <span className="font-display font-bold text-sm text-primary uppercase tracking-wide text-center">{b}</span>
          </a>
        ))}
      </Carousel>
    </section>
  </>
);
