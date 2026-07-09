'use client';

import { useRef, useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { InfoPageShell } from '@/components/static/InfoPageShell';
import { companyInfo, contactContent } from '@/data/staticPages';

const ContactPage = () => {
  const { breadcrumbs, title, subtitle, formIntro } = contactContent;
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    formRef.current?.reset();
    setSubmitted(true);
  };

  const contactCards = [
    {
      icon: Clock,
      label: 'Radno vreme',
      bg: 'bg-accent',
      iconColor: 'text-primary',
      grow: true,
      content: (
        <ul className="space-y-1 mt-1">
          {companyInfo.supportHours.map((row) => (
            <li key={row.day} className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">{row.day}</span>
              <span className="font-medium text-foreground">{row.hours}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      icon: Phone,
      label: 'Telefon',
      bg: 'bg-primary',
      iconColor: 'text-accent',
      href: `tel:${companyInfo.phones[0].replace(/\s/g, '')}`,
      content: (
        <div className="mt-1">
          {companyInfo.phones.map((phone) => (
            <p key={phone} className="font-display font-bold text-primary">
              {phone}
            </p>
          ))}
        </div>
      ),
    },
    {
      icon: Mail,
      label: 'E-mail',
      bg: 'bg-accent',
      iconColor: 'text-primary',
      href: `mailto:${companyInfo.email}`,
      content: (
        <p className="font-display font-bold text-primary break-all mt-1">{companyInfo.email}</p>
      ),
    },
    {
      icon: MapPin,
      label: 'Adresa',
      bg: 'bg-primary',
      iconColor: 'text-accent',
      content: (
        <div className="mt-1">
          <p className="font-display font-bold text-primary">{companyInfo.legalName}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{companyInfo.address.full}</p>
        </div>
      ),
    },
  ];

  return (
    <InfoPageShell breadcrumbs={breadcrumbs} title={title} subtitle={subtitle}>
      <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12">
        {/* Info kartice */}
        <div className="flex flex-col gap-4 lg:h-full">
          {contactCards.map(({ icon: Icon, label, bg, iconColor, href, grow, content }) => {
            const inner = (
              <>
                <div className={`w-11 h-11 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {label}
                  </p>
                  {content}
                </div>
              </>
            );

            const baseClass = `flex items-start gap-4 p-5 rounded-xl border border-border bg-white shadow-sm ${grow ? 'flex-1' : ''}`;

            return href ? (
              <a
                key={label}
                href={href}
                className={`${baseClass} hover:border-primary/25 hover:shadow-card transition-all group`}
              >
                {inner}
              </a>
            ) : (
              <div key={label} className={baseClass}>
                {inner}
              </div>
            );
          })}
        </div>

        {/* Forma */}
        <div className="rounded-xl border border-border bg-white shadow-sm p-6 md:p-8 flex flex-col">
          <h2 className="font-display font-bold text-primary uppercase text-sm tracking-wide mb-1">
            Pošaljite poruku
          </h2>
          <p className="text-sm text-muted-foreground mb-6">{formIntro}</p>

          {submitted && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-3 mb-5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-display font-bold text-emerald-800 text-sm">Poruka je poslata!</p>
                <p className="text-xs text-emerald-700">Javićemo vam se u najkraćem mogućem roku.</p>
              </div>
            </div>
          )}

          <form ref={formRef} className="space-y-4 flex-1 flex flex-col" onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-semibold text-foreground mb-1.5 block">Ime i prezime</span>
                <input
                  type="text"
                  required
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-foreground mb-1.5 block">Telefon</span>
                <input
                  type="tel"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-foreground mb-1.5 block">E-mail</span>
              <input
                type="email"
                required
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label className="block flex-1 flex flex-col">
              <span className="text-xs font-semibold text-foreground mb-1.5 block">Poruka</span>
              <textarea
                required
                rows={5}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none resize-y min-h-[7rem] flex-1 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <button
              type="submit"
              className="btn-yellow w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-sm mt-auto"
            >
              <Send className="w-4 h-4" />
              Pošalji poruku
            </button>
          </form>
        </div>
      </div>

      {/* Google Maps */}
      <div className="max-w-5xl mx-auto mt-10 rounded-xl overflow-hidden border border-border shadow-sm">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2918.242369234858!2d21.9339047!3d42.99423079999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475583737055cdff%3A0xa172113ad40886fe!2sKoncar%20Elektro!5e0!3m2!1sen!2srs!4v1782475254259!5m2!1sen!2srs"
          title="Lokacija Končar Elektro"
          className="w-full h-[400px] md:h-[450px] border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </InfoPageShell>
  );
};

export default ContactPage;
