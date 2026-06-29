import { useState } from 'react';
import { Check, ChevronRight, Plus, Minus, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GoogleReviews } from '@/components/home/GoogleReviews';
import { ROUTES } from '@/lib/catalogUrls';
import { brand, contactChannels } from '@/data/staticPages';
import agentAvatar from '@/assets/agent-avatar.png';

type FaqItem = { question: string; answer: string };

type Props = {
  variant: 'category' | 'listing';
  whyBuy: string[];
  faq: FaqItem[];
  whyTitle?: string;
};

export const CatalogInfoSections = ({ variant, whyBuy, faq, whyTitle }: Props) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const isCategory = variant === 'category';

  return (
    <section className={`${isCategory ? 'bg-white' : 'bg-secondary/40 border-t border-border'} ${isCategory ? 'relative overflow-hidden border-t border-border' : ''}`}>
      <div className={`container ${isCategory ? 'py-10 lg:py-12' : 'py-10'}`}>
        <div className={`grid grid-cols-1 gap-8 ${isCategory ? 'lg:grid-cols-3 lg:gap-10 lg:pr-[16rem] xl:pr-[20rem]' : 'lg:grid-cols-3'}`}>
          <div className={isCategory ? 'py-2' : undefined}>
            <h3 className="section-heading text-base md:text-base mb-5">
              {whyTitle ?? (isCategory ? brand.whyChooseTitle : 'Zašto kupiti kod nas?')}
            </h3>
            <ul className="space-y-3">
              {whyBuy.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground/90">
                  <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-accent-foreground" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {isCategory ? (
            <div className="py-2 lg:px-6">
              <h3 className="section-heading text-base md:text-base mb-5">Google ocene kupaca</h3>
              <GoogleReviews rating={4.9} reviewCount={1248} variant="light" />
            </div>
          ) : (
            <div>
              <h3 className="section-heading text-base md:text-base mb-5">Često postavljana pitanja</h3>
              <ul className="divide-y divide-border border-t border-border bg-white rounded-lg border px-4">
                {faq.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <li key={item.question}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full flex items-center justify-between gap-3 text-sm text-left py-3.5"
                      >
                        <span>{item.question}</span>
                        {isOpen ? <Minus className="w-4 h-4 text-primary shrink-0" /> : <Plus className="w-4 h-4 text-primary shrink-0" />}
                      </button>
                      {isOpen && <p className="text-xs text-muted-foreground pb-3 pr-8">{item.answer}</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            {isCategory ? (
              <>
                <h3 className="section-heading text-base md:text-base mb-5">Često postavljana pitanja</h3>
                <ul className="divide-y divide-border border-t border-border bg-white rounded-lg border px-4 mb-4">
                  {faq.map((item, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <li key={item.question}>
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : index)}
                          className="w-full flex items-center justify-between gap-3 text-sm text-left py-3.5"
                        >
                          <span>{item.question}</span>
                          {isOpen ? <Minus className="w-4 h-4 text-primary shrink-0" /> : <Plus className="w-4 h-4 text-primary shrink-0" />}
                        </button>
                        {isOpen && <p className="text-xs text-muted-foreground pb-3 pr-8">{item.answer}</p>}
                      </li>
                    );
                  })}
                </ul>
                <Link to={ROUTES.faq} className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:underline">
                  Pogledajte sva pitanja <ChevronRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <div className="bg-primary rounded-lg p-6 text-white relative overflow-hidden min-h-[220px]">
                <h3 className="font-display font-bold uppercase text-sm mb-2 relative z-10">Trebate pomoć pri izboru?</h3>
                <p className="text-sm text-white/80 mb-4 relative z-10 max-w-[55%]">
                  Naš tim stručnjaka stoji vam na raspolaganju za savet pri izboru alata.
                </p>
                <a href={contactChannels.primaryPhoneHref} className="btn-yellow text-xs inline-flex items-center gap-2 relative z-10">
                  <Phone className="w-4 h-4" /> {contactChannels.primaryPhone}
                </a>
                <img
                  src={agentAvatar}
                  alt=""
                  className="absolute right-0 bottom-0 h-[115%] max-w-[48%] object-contain object-bottom pointer-events-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {isCategory && (
        <img
          src={agentAvatar}
          alt="Stručna podrška"
          className="hidden lg:block absolute right-0 bottom-0 h-[108%] max-w-[min(28vw,360px)] object-contain object-bottom pointer-events-none select-none"
        />
      )}

      {!isCategory && (
        <div className="border-t border-border bg-white">
          <div className="container py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs text-muted-foreground">
            {['Provereni brendovi', 'Garancija kvaliteta', 'Brza isporuka', 'Stručna podrška'].map((t) => (
              <span key={t} className="font-medium">{t}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
