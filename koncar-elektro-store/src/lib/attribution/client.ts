'use client';

import {
  applyTouch,
  parseRecord,
  resolveTouch,
  type AttributionPayload,
  type AttributionRecord,
} from './shared';

const SESSION_KEY = 'ke_attribution_v1';
const PERSIST_KEY = 'ke_attribution_persist_v1';
/** Last-touch window for returning visitors (only when cookies are accepted). */
const PERSIST_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type Persisted = { savedAt: number; record: AttributionRecord };

const read = (storage: Storage, key: string): unknown => {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const write = (storage: Storage, key: string, value: unknown) => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // private mode / quota — attribution is best-effort, never block the shop
  }
};

const readSession = (): AttributionRecord | null => {
  try {
    return parseRecord(read(window.sessionStorage, SESSION_KEY));
  } catch {
    return null;
  }
};

const readPersisted = (): AttributionRecord | null => {
  try {
    const raw = read(window.localStorage, PERSIST_KEY) as Persisted | null;
    if (!raw || typeof raw.savedAt !== 'number') return null;
    if (Date.now() - raw.savedAt > PERSIST_TTL_MS) {
      window.localStorage.removeItem(PERSIST_KEY);
      return null;
    }
    return parseRecord(raw.record);
  } catch {
    return null;
  }
};

/**
 * Call once per full page load (landing). Client-side route changes keep the
 * original `document.referrer`, so only the first load carries source info.
 *
 * - Always keeps the record in sessionStorage (needed to attribute the order).
 * - With `persist` (analytics cookies accepted) the record also survives
 *   across visits for 30 days, so a shopper who came from Instagram on Monday
 *   and orders directly on Thursday is still attributed to Instagram.
 */
export function captureAttribution(persist: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const touch = resolveTouch({
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      ownHosts: [window.location.hostname],
    });

    const fromSession = readSession();
    const existing = fromSession ?? (persist ? readPersisted() : null);
    const isNewSession = !fromSession;

    let next = applyTouch(existing, touch, window.location.pathname);
    if (existing && isNewSession) {
      // Returning visitor in a fresh tab/session.
      next = { ...next, sessions: next.sessions + 1 };
    }
    write(window.sessionStorage, SESSION_KEY, next);
    if (persist) write(window.localStorage, PERSIST_KEY, { savedAt: Date.now(), record: next });
  } catch {
    // ignore
  }
}

/** Counts a page view in the current record (route change inside the SPA). */
export function bumpAttributionPage(persist: boolean): void {
  if (typeof window === 'undefined') return;
  const record = readSession();
  if (!record) return;
  const next = { ...record, pages: Math.min(record.pages + 1, 10_000) };
  write(window.sessionStorage, SESSION_KEY, next);
  if (persist) write(window.localStorage, PERSIST_KEY, { savedAt: Date.now(), record: next });
}

/** Consent changed: copy the session record to long-term storage, or wipe it. */
export function syncAttributionPersistence(persist: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (!persist) {
      window.localStorage.removeItem(PERSIST_KEY);
      return;
    }
    const record = readSession();
    if (record) write(window.localStorage, PERSIST_KEY, { savedAt: Date.now(), record });
  } catch {
    // ignore
  }
}

/**
 * Snapshot to send with checkout. Never throws; returns `undefined` when
 * nothing was captured so the order still goes through unchanged.
 */
export function getAttributionPayload(): AttributionPayload | undefined {
  if (typeof window === 'undefined') return undefined;
  return readSession() ?? readPersisted() ?? undefined;
}
