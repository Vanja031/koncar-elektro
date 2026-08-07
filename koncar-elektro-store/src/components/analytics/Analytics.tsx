'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useConsent } from '@/context/ConsentContext';
import { GA_MEASUREMENT_ID, GTM_CONTAINER_ID, trackPageview } from '@/lib/analytics/gtag';

/**
 * Loads GA4 (gtag.js) and/or GTM only after the visitor accepts analytics
 * cookies AND `NEXT_PUBLIC_ANALYTICS_LIVE=true` is set (on top of having an
 * id configured) — see `src/lib/analytics/gtag.ts` for why that extra switch
 * exists. Second safety net here: even if that flag were set too early by
 * mistake, this refuses to fire on any hostname other than the real
 * production domain, so staging/localhost/Vercel preview traffic can never
 * leak into the live GA4 property.
 */
const PRODUCTION_HOSTNAME = 'koncarelektro.rs';

export const Analytics = () => {
  const { choice } = useConsent();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onProductionHost =
    typeof window !== 'undefined' && window.location.hostname.endsWith(PRODUCTION_HOSTNAME);
  const granted = choice === 'accepted' && onProductionHost;

  useEffect(() => {
    if (!granted || !GA_MEASUREMENT_ID) return;
    const query = searchParams.toString();
    trackPageview(query ? `${pathname}?${query}` : pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granted, pathname, searchParams]);

  if (!granted) return null;

  return (
    <>
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
              window.gtag = gtag;
            `}
          </Script>
        </>
      )}
      {GTM_CONTAINER_ID && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
          `}
        </Script>
      )}
    </>
  );
};
