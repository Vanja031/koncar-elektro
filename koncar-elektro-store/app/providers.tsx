'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Suspense, useState, type ReactNode } from 'react';
import { CartProvider } from '@/context/CartContext';
import { ConsentProvider } from '@/context/ConsentContext';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { Analytics } from '@/components/analytics/Analytics';
import { CookieConsentBanner } from '@/components/consent/CookieConsentBanner';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

config.autoAddCss = false;

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ConsentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CartProvider>
            <ScrollToTop />
            <Suspense fallback={null}>
              <Analytics />
            </Suspense>
            {children}
            <CookieConsentBanner />
          </CartProvider>
        </TooltipProvider>
      </ConsentProvider>
    </QueryClientProvider>
  );
}
