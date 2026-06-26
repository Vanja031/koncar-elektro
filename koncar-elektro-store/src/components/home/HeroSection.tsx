import { Phone, Check, ChevronRight as ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { popularCategories } from '@/data/homepage';
import { getPopularCategoryUrl, getTopCategoryUrl } from '@/lib/catalogUrls';
import { leftCarouselSlides, rightCarouselSlides } from '@/data/homeHero';
import { FaIcon, trustIcons } from './FaIcon';
import { HeroCarousel } from './HeroCarousel';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import agentAvatar from '@/assets/agent-avatar.png';
import promoVan from '@/assets/van.png';
import garancijaBadge from '@/assets/garancija-badge.png';

const trustItems: { icon: IconDefinition; title: string; sub: string }[] = [
  { icon: trustIcons.support, title: 'Stručna podrška', sub: 'Tu smo da vam pomognemo' },
  { icon: trustIcons.delivery, title: 'Brza isporuka', sub: 'Isporuka na adresu za 1–2 radna dana' },
  { icon: trustIcons.warranty, title: 'Garancija i servis', sub: 'Garancija na sve proizvode i ovlašćeni servis' },
  { icon: trustIcons.returns, title: 'Lak povrat robe', sub: 'Mogućnost povrata u roku od 14 dana' },
  { icon: trustIcons.secure, title: 'Sigurna kupovina', sub: 'Bezbedno plaćanje svim karticama' },
];

export const HeroSection = () => (
  <>
    <section className="container py-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <HeroCarousel slides={leftCarouselSlides} />
      <HeroCarousel slides={rightCarouselSlides} />
    </section>

    {/* Trust strip */}
    <section className="container pb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {trustItems.map((x) => (
          <div
            key={x.title}
            className="trust-card bg-white border border-border rounded-md flex items-center gap-4 p-4 min-h-[88px]"
          >
            <div className="trust-card-icon shrink-0">
              <FaIcon icon={x.icon} className="text-[1.65rem]" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-sm text-primary leading-tight">{x.title}</div>
              <div className="text-xs text-muted-foreground leading-snug mt-1">{x.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Popular categories */}
    <section className="container py-6">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="section-heading">Popularne kategorije</h2>
        <Link to={getTopCategoryUrl('alati')} className="section-link">Pogledajte sve kategorije <ArrowRight className="w-4 h-4" /></Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {popularCategories.map((c) => (
          <Link
            key={c.name}
            to={getPopularCategoryUrl(c.name)}
            className="group flex items-center gap-3 bg-white border border-border rounded p-3 hover:border-primary/30 hover:shadow-card transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold text-xs md:text-sm text-primary uppercase leading-tight">{c.name}</div>
            </div>
            <img src={c.image} alt="" className="w-14 h-12 object-contain shrink-0 group-hover:scale-105 transition-transform" loading="lazy" />
            <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0">
              <ArrowRight className="w-3.5 h-3.5 text-accent-foreground" />
            </span>
          </Link>
        ))}
      </div>
    </section>

    {/* Three promo cards */}
    <section className="container pb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative rounded overflow-hidden bg-primary min-h-[220px] flex">
        <div className="relative z-10 flex-1 p-6 flex flex-col justify-center max-w-[58%]">
          <h3 className="font-display font-bold text-lg text-white uppercase leading-tight mb-3">
            Kupuj alat uz pomoć stručnjaka!
          </h3>
          <ul className="space-y-2 mb-4">
            {['Stručni savet pri izboru', 'Pomoć pri odabiru alata', 'Podrška i posle kupovine'].map((t) => (
              <li key={t} className="flex items-center gap-2 text-white/90 text-xs">
                <Check className="w-4 h-4 text-accent shrink-0" /> {t}
              </li>
            ))}
          </ul>
          <a href="tel:0111234567" className="btn-yellow w-fit text-xs flex items-center gap-2">
            <Phone className="w-4 h-4" /> 011 123 4567
          </a>
        </div>
        <img
          src={agentAvatar}
          alt="Stručna podrška"
          className="absolute right-0 bottom-0 h-[108%] max-w-[48%] object-contain object-bottom pointer-events-none"
        />
      </div>

      <div className="relative rounded overflow-hidden bg-accent min-h-[220px] flex">
        <div className="relative z-10 flex-1 p-6 flex flex-col justify-center max-w-[58%]">
          <h3 className="font-display font-bold text-lg text-primary uppercase leading-tight mb-3">
            Danas poručeno – sutra isporučeno!
          </h3>
          <ul className="space-y-2 mb-4">
            {['Brza dostava na adresu', 'Sigurno pakovanje', 'Praćenje pošiljke'].map((t) => (
              <li key={t} className="flex items-center gap-2 text-primary/80 text-xs">
                <Check className="w-4 h-4 text-primary shrink-0" /> {t}
              </li>
            ))}
          </ul>
          <a href="#" className="btn-navy w-fit text-xs">Saznajte više</a>
        </div>
        <img
          src={promoVan}
          alt="Dostava"
          className="absolute right-0 bottom-0 h-[112%] max-w-[68%] object-contain object-bottom pointer-events-none"
        />
      </div>

      <div className="relative rounded overflow-hidden bg-primary min-h-[220px] flex">
        <div className="relative z-10 flex-1 p-6 flex flex-col justify-center max-w-[58%]">
          <h3 className="font-display font-bold text-lg text-white uppercase leading-tight mb-3">
            Garancija na sve proizvode
          </h3>
          <ul className="space-y-2 mb-4">
            {['Ovlašćeni servis', 'Originalni delovi', 'Kupovina bez brige'].map((t) => (
              <li key={t} className="flex items-center gap-2 text-white/90 text-xs">
                <Check className="w-4 h-4 text-accent shrink-0" /> {t}
              </li>
            ))}
          </ul>
          <a href="#" className="btn-yellow w-fit text-xs">Saznajte više →</a>
        </div>
        <img
          src={garancijaBadge}
          alt="Garancija 100%"
          className="absolute right-0 bottom-0 translate-y-4 h-[120%] max-w-[72%] object-contain object-bottom pointer-events-none"
        />
      </div>
    </section>
  </>
);
