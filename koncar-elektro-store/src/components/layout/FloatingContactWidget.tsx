'use client';

import { useEffect, useRef, useState } from 'react';
import { Phone, X } from 'lucide-react';
import { FaIcon, footerIcons } from '@/components/home/FaIcon';
import { SocialIcon } from '@/components/home/SocialIcon';
import { contactChannels } from '@/data/staticPages';

type ChannelButton = {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  bg: string;
};

const channelButtons: ChannelButton[] = [
  {
    key: 'viber',
    label: 'Viber',
    href: contactChannels.viberHref,
    icon: <SocialIcon name="viber" className="w-5 h-5" />,
    bg: 'bg-[#7360f2]',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    href: contactChannels.whatsappHref,
    icon: <SocialIcon name="whatsapp" className="w-5 h-5" />,
    bg: 'bg-[#25d366]',
  },
  {
    key: 'phone',
    label: 'Pozovite nas',
    href: contactChannels.primaryPhoneHref,
    icon: <Phone className="w-5 h-5 text-white" />,
    bg: 'bg-primary',
  },
];

/** Expandable sticky contact button — reveals Viber / WhatsApp / phone shortcuts. */
export const FloatingContactWidget = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="fixed z-50 flex flex-col items-end gap-2.5 bottom-4 right-3 sm:bottom-6 sm:right-6"
    >
      {open && (
        <div className="flex flex-col items-end gap-2.5 mb-1">
          {channelButtons.map(({ key, label, href, icon, bg }) => (
            <a
              key={key}
              href={href}
              target={key === 'phone' ? undefined : '_blank'}
              rel={key === 'phone' ? undefined : 'noopener noreferrer'}
              className={`flex items-center gap-2.5 ${bg} text-white rounded-full shadow-navy-soft hover:brightness-110 transition-all font-semibold py-2.5 px-3.5 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2`}
              aria-label={label}
            >
              <span className="shrink-0">{icon}</span>
              <span className="truncate">{label}</span>
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center gap-2 bg-primary text-white rounded-full shadow-navy-soft hover:brightness-110 transition-all font-semibold min-[380px]:justify-start py-2.5 px-3 min-[380px]:pl-3 min-[380px]:pr-3.5 text-xs sm:gap-2.5 sm:pl-4 sm:pr-5 sm:py-3 sm:text-sm"
        aria-label={open ? 'Zatvori kontakt opcije' : 'Stručna pomoć'}
        aria-expanded={open}
      >
        {open ? (
          <X className="w-4 h-4 shrink-0" />
        ) : (
          <FaIcon icon={footerIcons.chat} className="text-base shrink-0" />
        )}
        <span className="hidden min-[380px]:inline truncate">
          {open ? 'Zatvori' : 'Stručna pomoć'}
        </span>
      </button>
    </div>
  );
};
