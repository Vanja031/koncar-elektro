'use client';

import { Cookie } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { useConsent } from '@/context/ConsentContext';

export const CookieConsentBanner = () => {
  const { choice, hydrated, acceptAll, rejectNonEssential } = useConsent();

  if (!hydrated || choice !== null) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Saglasnost za kolačiće"
      className="cookie-consent"
    >
      <div className="cookie-consent-icon" aria-hidden>
        <Cookie className="w-5 h-5" strokeWidth={2.25} />
      </div>

      <div className="cookie-consent-body">
        <p className="cookie-consent-title">Poštujemo vašu privatnost</p>
        <p className="cookie-consent-text">
          Koristimo kolačiće kako bismo maksimalno unapredili vaše iskustvo i pružili
          personalizovane ponude.{' '}
          <Link to="/politika-privatnosti" className="cookie-consent-link">
            Saznajte više
          </Link>
        </p>

        <div className="cookie-consent-actions">
          <button type="button" onClick={rejectNonEssential} className="cookie-consent-btn-ghost">
            Odbij
          </button>
          <button type="button" onClick={acceptAll} className="cookie-consent-btn-accept">
            Prihvati
          </button>
        </div>
      </div>
    </div>
  );
};
