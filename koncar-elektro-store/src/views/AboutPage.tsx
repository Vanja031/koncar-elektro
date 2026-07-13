'use client';

import { Link } from '@/lib/router-compat';
import { Target, Eye, Wrench, Phone, ChevronRight, Trophy, ShieldCheck, Package, Users } from 'lucide-react';
import { InfoPageShell } from '@/components/static/InfoPageShell';
import { aboutContent, contactChannels } from '@/data/staticPages';
import { Carousel } from '@/components/home/Carousel';
import { BrandMark } from '@/components/brand/BrandMark';
import agentAvatar from '@/assets/agent-avatar.png';
import heroExpert from '@/assets/hero-expert.png';

const highlightConfig = [
  { icon: Trophy,       bg: 'bg-accent',   iconColor: 'text-primary' },
  { icon: ShieldCheck,  bg: 'bg-primary',  iconColor: 'text-accent'  },
  { icon: Package,      bg: 'bg-accent',   iconColor: 'text-primary' },
  { icon: Users,        bg: 'bg-primary',  iconColor: 'text-accent'  },
];

const valueConfig = [
  { icon: Target, bg: 'bg-primary', iconColor: 'text-accent' },
  { icon: Eye,    bg: 'bg-accent',  iconColor: 'text-primary' },
  { icon: Wrench, bg: 'bg-primary', iconColor: 'text-accent' },
];

const AboutPage = () => {
  const { breadcrumbs, title, subtitle, story, mission, vision, service, authorizedBrands, highlights, programs } =
    aboutContent;

  const values = [
    { label: 'Misija', text: mission },
    { label: 'Vizija', text: vision },
    { label: 'Servis', text: service },
  ];

  return (
    <InfoPageShell breadcrumbs={breadcrumbs} title={title} subtitle={subtitle}>
      <div className="max-w-5xl mx-auto space-y-14 md:space-y-20">

        {/* Stat kartice */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {highlights.map((item, i) => {
            const { icon: Icon, bg, iconColor } = highlightConfig[i];
            return (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-white px-4 py-4 md:px-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.75} />
                  </div>
                  <p className="font-display font-bold text-base md:text-lg text-primary leading-tight">
                    {item.title}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Naša priča */}
        <section className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <p className="text-accent font-display font-bold text-xs uppercase tracking-widest mb-3">Naša priča</p>
            <h2 className="font-display font-bold text-primary text-2xl md:text-3xl uppercase mb-6 leading-tight">
              Više od tri decenije<br />na vašoj strani
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              {story.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/3]">
            <img
              src={heroExpert}
              alt="Stručni tim Končar Elektro"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Vrednosti */}
        <section>
          <h2 className="section-heading text-xl md:text-2xl mb-6">Vrednosti koje nas vode</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {values.map(({ label, text }, i) => {
              const { icon: Icon, bg, iconColor } = valueConfig[i];
              return (
                <article
                  key={label}
                  className="rounded-xl border border-border bg-white p-7 shadow-sm flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={1.75} />
                    </div>
                    <h3 className="font-display font-bold text-primary uppercase text-lg tracking-wide">
                      {label}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{text}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Ovlašćeni distributeri – carousel */}
        <section>
          <h2 className="section-heading text-xl md:text-2xl mb-6">Ovlašćeni distributeri</h2>
          <Carousel>
            {authorizedBrands.map((brandName) => (
              <div
                key={brandName}
                className="h-20 rounded-xl border border-border bg-white shadow-sm flex items-center justify-center px-4 hover:border-primary/30 hover:shadow-md transition-all"
                title={brandName}
              >
                <BrandMark
                  brand={brandName}
                  size="lg"
                  imgClassName="max-h-12 max-w-[90%] object-center mx-auto"
                  className="text-center"
                />
              </div>
            ))}
          </Carousel>
        </section>

        {/* Šta možete pronaći */}
        <section>
          <h2 className="section-heading text-xl md:text-2xl mb-6">Šta možete pronaći kod nas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {programs.map(({ label, href }) => (
              <Link
                key={label}
                to={href}
                className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl border border-border/80 bg-white text-sm text-foreground hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span className="font-medium">{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-accent shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </section>

        {/* CTA s agent avatarem */}
        <div className="rounded-2xl bg-primary overflow-hidden">
          <div className="grid md:grid-cols-[1fr_auto] items-end">
            <div className="px-8 py-10 md:px-12 md:py-12">
              <p className="text-accent font-display font-bold text-xs uppercase tracking-widest mb-3">
                Stručni tim na usluzi
              </p>
              <h2 className="font-display font-bold text-white text-2xl md:text-3xl uppercase leading-tight mb-4">
                Tu smo za vas
              </h2>
              <p className="text-sm text-white/75 leading-relaxed max-w-md mb-8">
                Imate pitanje o alatu, projektu ili servisu? Naš tim stručnjaka sa 30+ godina iskustva
                spreman je da vam pomogne pri odabiru prave opreme i pronalaženju pravog rešenja.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/kontakt" className="btn-yellow px-8 py-3 text-sm">
                  Kontaktirajte nas
                </Link>
                <a
                  href={contactChannels.primaryPhoneHref}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  <Phone className="w-4 h-4 text-accent" />
                  {contactChannels.primaryPhone}
                </a>
              </div>
            </div>
            <div className="hidden md:flex items-end justify-end px-6 h-72">
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

export default AboutPage;
