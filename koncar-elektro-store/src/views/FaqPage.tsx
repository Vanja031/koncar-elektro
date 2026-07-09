'use client';

import { Link } from '@/lib/router-compat';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import { InfoPageShell } from '@/components/static/InfoPageShell';
import { StaticFaqAccordion } from '@/components/static/StaticFaqAccordion';
import { faqPageContent, staticFaqItems, companyInfo } from '@/data/staticPages';
import agentAvatar from '@/assets/agent-avatar.png';

const FaqPage = () => {
  const { breadcrumbs, title, subtitle } = faqPageContent;

  return (
    <InfoPageShell breadcrumbs={breadcrumbs} title={title} subtitle={subtitle}>
      <div className="max-w-3xl mx-auto space-y-10">
        <StaticFaqAccordion items={staticFaqItems} />

        {/* CTA */}
        <div className="rounded-2xl bg-primary overflow-hidden">
          <div className="grid md:grid-cols-[1fr_auto] items-end">
            <div className="px-8 py-10 md:px-10">
              <p className="text-accent font-display font-bold text-xs uppercase tracking-widest mb-3">
                Nismo odgovorili?
              </p>
              <h2 className="font-display font-bold text-white text-xl md:text-2xl uppercase leading-tight mb-3">
                Kontaktirajte naš tim
              </h2>
              <p className="text-sm text-white/75 leading-relaxed mb-7 max-w-sm">
                Naši stručnjaci su tu da odgovore na sva vaša pitanja — o proizvodima, porudžbinama, servisu ili bilo čemu drugom.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/kontakt"
                  className="btn-yellow inline-flex items-center gap-2 px-6 py-2.5 text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Pošaljite poruku
                </Link>
                <a
                  href={`tel:${companyInfo.phones[0].replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  <Phone className="w-4 h-4 text-accent" />
                  Pozovite
                </a>
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  <Mail className="w-4 h-4 text-accent" />
                  E-mail
                </a>
              </div>
            </div>
            <div className="hidden md:flex items-end justify-end px-6 h-48">
              <img
                src={agentAvatar}
                alt="Stručni konsultant"
                className="h-full object-contain object-bottom"
              />
            </div>
          </div>
        </div>
      </div>
    </InfoPageShell>
  );
};

export default FaqPage;
