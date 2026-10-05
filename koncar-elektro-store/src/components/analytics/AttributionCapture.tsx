'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useConsent } from '@/context/ConsentContext';
import {
  bumpAttributionPage,
  captureAttribution,
  syncAttributionPersistence,
} from '@/lib/attribution/client';

/**
 * Remembers where the visitor came from (UTM / referrer / ad click id) so the
 * order can be tagged in WooCommerce. Renders nothing; works regardless of the
 * analytics-cookie choice (session-only), and persists 30 days only if accepted.
 */
export const AttributionCapture = () => {
  const { choice, hydrated } = useConsent();
  const pathname = usePathname();
  const captured = useRef(false);
  const lastPath = useRef<string | null>(null);
  const persist = choice === 'accepted';

  useEffect(() => {
    // Wait for consent to be read so we don't write persistently by mistake.
    if (!hydrated) return;
    if (!captured.current) {
      captured.current = true;
      captureAttribution(persist);
    } else {
      syncAttributionPersistence(persist);
    }
  }, [hydrated, persist]);

  useEffect(() => {
    if (!captured.current) {
      lastPath.current = pathname;
      return;
    }
    if (lastPath.current !== null && lastPath.current !== pathname) {
      bumpAttributionPage(persist);
    }
    lastPath.current = pathname;
  }, [pathname, persist]);

  return null;
};
