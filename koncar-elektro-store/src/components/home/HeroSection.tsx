import { leftCarouselSlides, rightCarouselSlides } from '@/data/homeHero';
import { FaIcon, trustIcons } from './FaIcon';
import { HeroCarousel } from './HeroCarousel';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const trustItems: { icon: IconDefinition; title: string; sub: string }[] = [
  { icon: trustIcons.support, title: 'Stručna podrška', sub: 'Tu smo da vam pomognemo' },
  { icon: trustIcons.delivery, title: 'Brza isporuka', sub: 'Isporuka na adresu za 1–2 radna dana' },
  { icon: trustIcons.warranty, title: 'Garancija i servis', sub: 'Garancija na sve proizvode i ovlašćeni servis' },
  { icon: trustIcons.returns, title: 'Lak povrat robe', sub: 'Mogućnost povrata u roku od 14 dana' },
  { icon: trustIcons.secure, title: 'Sigurna kupovina', sub: 'Bezbedno plaćanje svim karticama' },
];

const allHeroSlides = [...leftCarouselSlides, ...rightCarouselSlides];

export const HeroSection = () => (
  <>
    <section className="lg:hidden py-3">
      <div className="container px-0 sm:px-4">
        <HeroCarousel slides={allHeroSlides} layout="mobile" />
      </div>
    </section>

    <section className="container py-4 hidden lg:grid lg:grid-cols-2 gap-4">
      <HeroCarousel slides={leftCarouselSlides} layout="desktop" />
      <HeroCarousel slides={rightCarouselSlides} layout="desktop" />
    </section>

    <section className="container pb-4 hidden lg:block">
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
  </>
);
