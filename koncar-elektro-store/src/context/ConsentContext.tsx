'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'koncar-cookie-consent-v1';

export type ConsentChoice = 'accepted' | 'rejected';

type ConsentContextValue = {
  /** `null` while the banner hasn't been answered yet (nothing persisted). */
  choice: ConsentChoice | null;
  /** `false` until the client has checked localStorage — avoids a banner flash. */
  hydrated: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

const readStoredChoice = (): ConsentChoice | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'accepted' || raw === 'rejected' ? raw : null;
  } catch {
    return null;
  }
};

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
  // Start `null` on both server and first client render to avoid hydration
  // mismatch, then sync from storage right after mount.
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setChoice(readStoredChoice());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: ConsentChoice) => {
    setChoice(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore (private mode / storage disabled) — consent still applies for this session
    }
  }, []);

  const acceptAll = useCallback(() => persist('accepted'), [persist]);
  const rejectNonEssential = useCallback(() => persist('rejected'), [persist]);

  // Before hydration completes, report "not decided yet" (banner hidden) rather
  // than a guessed value — avoids briefly loading analytics before consent is known.
  const value: ConsentContextValue = {
    choice: hydrated ? choice : null,
    hydrated,
    acceptAll,
    rejectNonEssential,
  };

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
};

export const useConsent = () => {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
};
