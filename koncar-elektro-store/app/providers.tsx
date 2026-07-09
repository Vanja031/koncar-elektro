'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { useState, type ReactNode } from 'react';
import { CartProvider } from '@/context/CartContext';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

config.autoAddCss = false;

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CartProvider>
          <ScrollToTop />
          {children}
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
