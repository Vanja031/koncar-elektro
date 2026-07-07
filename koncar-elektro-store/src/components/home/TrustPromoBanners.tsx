import { Phone, Check } from 'lucide-react';
import { contactChannels } from '@/data/staticPages';
import agentAvatar from '@/assets/agent-avatar.png';
import promoVan from '@/assets/van.png';
import garancijaBadge from '@/assets/garancija-badge.png';

export const TrustPromoBanners = () => (
  <section className="container py-6 md:py-8 grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <a href={contactChannels.primaryPhoneHref} className="btn-yellow w-fit text-xs flex items-center gap-2">
          <Phone className="w-4 h-4" /> {contactChannels.primaryPhone}
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
        className="trust-promo-van-img"
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
        <a href="#" className="btn-yellow w-fit text-xs">Saznajte više</a>
      </div>
      <img
        src={garancijaBadge}
        alt="Garancija 100%"
        className="trust-promo-garancija-img"
      />
    </div>
  </section>
);
