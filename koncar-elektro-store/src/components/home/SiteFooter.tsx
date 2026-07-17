import { Link } from '@/lib/router-compat';
import {
  ChevronRight,
  Drill, Plug, Lightbulb, Sun,
} from 'lucide-react';
import {
  categoryHighlights, valueProps, footerServiceLinks, footerInfoLinks,
  paymentBanks,
} from '@/data/homepage';
import { brand, companyInfo, contactChannels, footerLinkRoutes } from '@/data/staticPages';
import { getTopCategoryUrl } from '@/lib/catalogUrls';
import { PaymentCardIcons } from '@/components/payment/PaymentCardIcons';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { SocialLinks } from './SocialLinks';
import { FaIcon, trustIcons, footerIcons } from './FaIcon';

const iconMap = { drill: Drill, plug: Plug, bulb: Lightbulb, solar: Sun } as const;

const valuePropIcons = [trustIcons.warranty, trustIcons.support, trustIcons.delivery] as const;

const footerLink = (label: string) => footerLinkRoutes[label];

const FooterNavLink = ({ label }: { label: string }) => {
  const href = footerLink(label);
  const className = 'footer-link group';

  if (href) {
    return (
      <Link to={href} className={className}>
        <span>{label}</span>
        <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-accent transition-colors shrink-0" />
      </Link>
    );
  }

  return (
    <a href="#" className={className}>
      <span>{label}</span>
      <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-accent transition-colors shrink-0" />
    </a>
  );
};

const highlightUrls: Record<string, string> = {
  'Profesionalni alati': getTopCategoryUrl('alati'),
  Elektromaterijal: getTopCategoryUrl('elektromaterijal'),
  Rasveta: getTopCategoryUrl('rasveta'),
  'Solarne elektrane': getTopCategoryUrl('solarne'),
};

export const CategoryHighlights = () => (
  <section className="bg-secondary/40 py-10">
    <div className="container space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryHighlights.map((c, i) => {
          const Icon = iconMap[c.icon];
          const iconOnYellow = i % 2 === 1;
          return (
            <Link
              key={c.title}
              to={highlightUrls[c.title] ?? getTopCategoryUrl('alati')}
              className="flex flex-col bg-white rounded-lg border border-border/60 shadow-sm hover:shadow-card hover:border-primary/20 transition-all group overflow-hidden h-full"
            >
              <div className="relative h-[8.5rem] sm:h-[9rem] px-3 pt-3 shrink-0">
                <div
                  className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded flex items-center justify-center ${
                    iconOnYellow ? 'bg-accent' : 'bg-primary'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 sm:w-7 sm:h-7 ${iconOnYellow ? 'text-primary' : 'text-accent'}`}
                    strokeWidth={1.75}
                  />
                </div>
                <img
                  src={c.image}
                  alt=""
                  className={`absolute object-contain object-bottom pointer-events-none group-hover:scale-[1.03] transition-transform ${
                    i === 0
                      ? 'right-1 bottom-1 h-[78%] max-w-[58%]'
                      : 'right-0 bottom-0 h-[118%] max-w-[78%]'
                  }`}
                  loading="lazy"
                />
              </div>
              <div className="px-4 pb-4 pt-1 flex-1">
                <h3 className="font-display font-bold text-primary uppercase text-xs sm:text-sm mb-1.5 leading-tight">
                  {c.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {valueProps.map((v, i) => (
          <div
            key={v.title}
            className="flex items-center gap-4 bg-white rounded-lg border border-border/60 p-5 shadow-sm hover:shadow-card transition-shadow"
          >
            <div className="w-14 h-14 rounded bg-primary flex items-center justify-center shrink-0">
              <FaIcon icon={valuePropIcons[i]} className="text-accent text-[1.35rem]" />
            </div>
            <div className="min-w-0">
              <h4 className="font-display font-bold text-primary text-sm mb-1">{v.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const AboutSection = () => (
  <section className="container py-10 border-t border-border">
    <h2 className="section-heading text-xl md:text-xl mb-6 max-w-3xl">
      Profesionalni alati, elektromaterijal i solarna oprema
    </h2>
    <div className="max-w-3xl space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        {brand.aboutIntro}
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Naš tim stručnjaka stoji vam na raspolaganju za savet pri izboru alata i opreme, a brza
        isporuka na teritoriji cele Srbije čini kupovinu jednostavnom i sigurnom.
      </p>
    </div>
  </section>
);

export const SiteFooter = () => (
  <footer className="bg-navy-dark text-white mt-4">
    <div className="container py-12 lg:py-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
        <div className="lg:col-span-3">
          <Link to="/" className="inline-flex items-center mb-6 rounded-lg bg-white px-3.5 py-2 shadow-sm">
            <BrandLogo className="h-11 sm:h-12" />
          </Link>
          <ul className="space-y-3.5 mb-6">
            {[
              { icon: footerIcons.phone, text: contactChannels.primaryPhone, href: contactChannels.primaryPhoneHref },
              { icon: footerIcons.mobile, text: contactChannels.secondaryPhone, href: contactChannels.secondaryPhoneHref },
              { icon: footerIcons.mail, text: contactChannels.email, href: contactChannels.emailHref },
              { icon: footerIcons.location, text: contactChannels.addressFull },
              { icon: footerIcons.clock, text: contactChannels.hoursSummary },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-white/90">
                <span className="footer-contact-icon">
                  <FaIcon icon={item.icon} />
                </span>
                {'href' in item && item.href ? (
                  <a href={item.href} className="hover:text-accent transition-colors">
                    {item.text}
                  </a>
                ) : (
                  item.text
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2 lg:col-start-5">
          <h4 className="title-accent-line font-display font-bold uppercase text-sm mb-4 tracking-wide">Korisnički servis</h4>
          <ul className="space-y-0">
            {footerServiceLinks.map((l) => (
              <li key={l}>
                <FooterNavLink label={l} />
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="title-accent-line font-display font-bold uppercase text-sm mb-4 tracking-wide">Informacije</h4>
          <ul className="space-y-0">
            {footerInfoLinks.map((l) => (
              <li key={l}>
                <FooterNavLink label={l} />
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h4 className="title-accent-line font-display font-bold uppercase text-sm mb-4 tracking-wide leading-snug">
            Prijavite se za akcije i specijalne ponude
          </h4>
          <p className="text-xs text-white/60 mb-4 leading-relaxed">
            Budite prvi informisani o akcijama i novim proizvodima.
          </p>
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Unesite vaš email"
                className="w-full bg-[#1a2d52] border border-white/15 rounded pl-4 pr-11 py-3 text-sm outline-none focus:border-accent placeholder:text-white/35 text-white"
              />
              <FaIcon
                icon={footerIcons.mail}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 text-sm pointer-events-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-accent text-accent-foreground font-display font-bold uppercase text-sm tracking-wide py-3 rounded flex items-center justify-center gap-2 hover:brightness-105 transition-all"
            >
              Prijavi me
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
          <SocialLinks variant="footer" className="mt-5" />
        </div>
      </div>
    </div>

    <div className="border-t border-white/10 bg-[#0c1a33]">
      <div className="container py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-[11px] text-white/45 uppercase tracking-widest font-semibold shrink-0">
            Načini plaćanja
          </p>
          <PaymentCardIcons size="sm" className="footer-payment-cards" />
          <span className="hidden sm:inline w-px h-6 bg-white/20" aria-hidden />
          {paymentBanks.map((p) => (
            <span key={p} className="footer-payment-bank">{p}</span>
          ))}
        </div>
      </div>
    </div>

    <div className="border-t border-white/10 bg-[#060f1f]">
      <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
        <span>© 2026 {companyInfo.name}. Sva prava zadržana.</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-white/60">
            <FaIcon icon={trustIcons.secure} className="text-accent text-sm" />
            Sigurna kupovina
          </span>
          <span className="text-white/40">Izrada sajta:</span>
        </div>
      </div>
    </div>
  </footer>
);
