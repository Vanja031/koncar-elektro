/**
 * Order attribution (headless replacement for WooCommerce's "Order Attribution"
 * tracking script, which only runs on the stock WP checkout).
 *
 * This file is pure (no window / no node APIs) so the exact same rules can be
 * unit-tested and shared between the browser capture and the server mapping.
 */

export type TouchType = 'utm' | 'organic' | 'referral' | 'typein';

/** A single visit source — what we know about how the shopper arrived. */
export type Touch = {
  type: TouchType;
  /** google / instagram / facebook / newsletter / example.com / (direct) */
  source: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  id?: string;
  /** Raw referrer URL (origin + path) when the browser provided one. */
  referrer?: string;
  /** Landing page path (no query string) of the visit. */
  entry: string;
  /** ISO timestamp of when this touch was recorded. */
  at: string;
};

export type AttributionRecord = {
  /** First known touch within the storage lifetime. */
  first: Touch;
  /** Latest *known* touch — direct/internal visits never overwrite it. */
  last: Touch;
  /** ISO timestamp the current record started. */
  startedAt: string;
  pages: number;
  sessions: number;
};

/** What the checkout sends to the BFF. */
export type AttributionPayload = AttributionRecord;

/** Our own hosts: a referrer from these is navigation inside the shop, not a source. */
const OWN_HOST_SUFFIXES = ['koncarelektro.rs', 'koncarelektro.com'];

/** Payment gateways return the shopper to us — must never be treated as a source. */
const IGNORED_HOST_SUFFIXES = ['raiaccept.com', 'raiffeisenbank.rs'];

const SOCIAL_HOSTS: Array<[suffix: string, source: string]> = [
  ['instagram.com', 'instagram'],
  ['facebook.com', 'facebook'],
  ['fb.com', 'facebook'],
  ['fb.me', 'facebook'],
  ['messenger.com', 'facebook'],
  ['tiktok.com', 'tiktok'],
  ['youtube.com', 'youtube'],
  ['youtu.be', 'youtube'],
  ['t.co', 'twitter'],
  ['twitter.com', 'twitter'],
  ['x.com', 'twitter'],
  ['linkedin.com', 'linkedin'],
  ['lnkd.in', 'linkedin'],
  ['pinterest.com', 'pinterest'],
  ['viber.com', 'viber'],
  ['whatsapp.com', 'whatsapp'],
  ['wa.me', 'whatsapp'],
];

const SEARCH_HOSTS: Array<[test: RegExp, source: string]> = [
  [/(^|\.)google\.[a-z.]+$/, 'google'],
  [/(^|\.)bing\.com$/, 'bing'],
  [/(^|\.)duckduckgo\.com$/, 'duckduckgo'],
  [/(^|\.)yahoo\.com$/, 'yahoo'],
  [/(^|\.)yandex\.[a-z.]+$/, 'yandex'],
  [/(^|\.)ecosia\.org$/, 'ecosia'],
  [/(^|\.)search\.brave\.com$/, 'brave'],
  [/(^|\.)startpage\.com$/, 'startpage'],
];

const hostMatches = (host: string, suffix: string) =>
  host === suffix || host.endsWith(`.${suffix}`);

export const isOwnHost = (host: string, extraOwnHosts: string[] = []) =>
  [...OWN_HOST_SUFFIXES, ...extraOwnHosts].some((s) => hostMatches(host, s));

const clean = (value: string | null | undefined, max = 120): string | undefined => {
  if (!value) return undefined;
  // eslint-disable-next-line no-control-regex
  const v = value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
  return v || undefined;
};

export type ResolveInput = {
  /** Full landing URL (`location.href`). */
  url: string;
  /** `document.referrer` ('' when absent or stripped). */
  referrer: string;
  userAgent: string;
  /** Extra hostnames to treat as "ourselves" (e.g. current staging host). */
  ownHosts?: string[];
  now?: Date;
};

const IN_APP_UA: Array<[test: RegExp, source: string]> = [
  [/Instagram/i, 'instagram'],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, 'facebook'],
  [/musical_ly|BytedanceWebview|TikTok/i, 'tiktok'],
];

/**
 * Decides which source (if any) this page load represents.
 * Returns `null` for direct visits, internal navigation and payment-gateway
 * returns — callers must NOT treat `null` as "unknown", only as "no new info".
 *
 * Priority (most to least reliable): explicit UTM → ad click ids → referrer →
 * in-app browser fingerprint (Instagram/Facebook often strip the referrer).
 */
export function resolveTouch(input: ResolveInput): Touch | null {
  let url: URL;
  try {
    url = new URL(input.url);
  } catch {
    return null;
  }

  // Coming back from the bank after a card payment is not a marketing touch.
  if (url.pathname.startsWith('/placanje-odjava')) return null;

  const params = url.searchParams;
  const at = (input.now ?? new Date()).toISOString();
  const entry = url.pathname.slice(0, 300);

  let refHost = '';
  let refShort: string | undefined;
  try {
    if (input.referrer) {
      const r = new URL(input.referrer);
      refHost = r.hostname.toLowerCase().replace(/^www\./, '');
      refShort = clean(`${r.origin}${r.pathname}`, 300);
    }
  } catch {
    refHost = '';
  }
  const refIgnored =
    !!refHost &&
    (isOwnHost(refHost, input.ownHosts) ||
      refHost === url.hostname.toLowerCase().replace(/^www\./, '') ||
      (input.ownHosts ?? []).some((h) => hostMatches(refHost, h)) ||
      IGNORED_HOST_SUFFIXES.some((s) => hostMatches(refHost, s)));
  const externalRefHost = refHost && !refIgnored ? refHost : '';

  const social = (host: string) => SOCIAL_HOSTS.find(([s]) => hostMatches(host, s))?.[1];
  const search = (host: string) => SEARCH_HOSTS.find(([re]) => re.test(host))?.[1];
  const inApp = IN_APP_UA.find(([re]) => re.test(input.userAgent))?.[1];

  // 1) Explicit UTM tagging always wins.
  const utmSource = clean(params.get('utm_source'))?.toLowerCase();
  if (utmSource) {
    return {
      type: 'utm',
      source: utmSource,
      medium: clean(params.get('utm_medium'))?.toLowerCase(),
      campaign: clean(params.get('utm_campaign')),
      content: clean(params.get('utm_content')),
      term: clean(params.get('utm_term')),
      id: clean(params.get('utm_id')),
      referrer: externalRefHost ? refShort : undefined,
      entry,
      at,
    };
  }

  // 2) Ad-platform click ids (autotagging) when no UTMs are present.
  if (params.has('gclid') || params.has('gbraid') || params.has('wbraid')) {
    return { type: 'utm', source: 'google', medium: 'cpc', referrer: externalRefHost ? refShort : undefined, entry, at };
  }
  if (params.has('msclkid')) {
    return { type: 'utm', source: 'bing', medium: 'cpc', referrer: externalRefHost ? refShort : undefined, entry, at };
  }
  if (params.has('fbclid') || params.has('igshid')) {
    // fbclid is appended to *all* outbound Meta links (organic too), so we can
    // name the platform but not claim it was paid.
    const source =
      (externalRefHost && social(externalRefHost)) ||
      inApp ||
      (params.has('igshid') ? 'instagram' : 'facebook');
    return { type: 'referral', source, medium: 'social', referrer: externalRefHost ? refShort : undefined, entry, at };
  }
  if (params.has('ttclid')) {
    return { type: 'referral', source: 'tiktok', medium: 'social', referrer: externalRefHost ? refShort : undefined, entry, at };
  }

  // 3) Referrer header.
  if (externalRefHost) {
    const searchSource = search(externalRefHost);
    if (searchSource) {
      return { type: 'organic', source: searchSource, medium: 'organic', referrer: refShort, entry, at };
    }
    const socialSource = social(externalRefHost);
    if (socialSource) {
      return { type: 'referral', source: socialSource, medium: 'social', referrer: refShort, entry, at };
    }
    return { type: 'referral', source: externalRefHost, medium: 'referral', referrer: refShort, entry, at };
  }

  // 4) In-app browsers (Instagram / Facebook / TikTok) frequently send no referrer.
  if (inApp && !refHost) {
    return { type: 'referral', source: inApp, medium: 'social', entry, at };
  }

  return null;
}

export function directTouch(entry: string, now: Date = new Date()): Touch {
  return { type: 'typein', source: '(direct)', entry: entry.slice(0, 300), at: now.toISOString() };
}

/**
 * Folds a new page load into the stored record.
 * - a real source becomes `last` (last-touch) and, if none existed, `first`
 * - a direct/internal visit never replaces a known source
 * - first visit with no source at all is recorded as direct
 */
export function applyTouch(
  existing: AttributionRecord | null,
  touch: Touch | null,
  entry: string,
  now: Date = new Date(),
): AttributionRecord {
  if (!existing) {
    const first = touch ?? directTouch(entry, now);
    return { first, last: first, startedAt: now.toISOString(), pages: 1, sessions: 1 };
  }
  if (!touch) return existing;
  return { ...existing, last: touch };
}

const TOUCH_TYPES: TouchType[] = ['utm', 'organic', 'referral', 'typein'];

/** Defensive parse of anything coming from storage or the network. */
export function parseTouch(raw: unknown): Touch | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown, max = 200) => (typeof v === 'string' ? clean(v, max) : undefined);
  const type = r.type as TouchType;
  const source = str(r.source);
  if (!TOUCH_TYPES.includes(type) || !source) return null;
  return {
    type,
    source,
    medium: str(r.medium),
    campaign: str(r.campaign),
    content: str(r.content),
    term: str(r.term),
    id: str(r.id),
    referrer: str(r.referrer, 300),
    entry: str(r.entry, 300) ?? '/',
    at: str(r.at, 40) ?? new Date(0).toISOString(),
  };
}

export function parseRecord(raw: unknown): AttributionRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const first = parseTouch(r.first);
  const last = parseTouch(r.last);
  if (!first || !last) return null;
  const int = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) ? Math.min(Math.max(Math.trunc(v), 1), 10_000) : fallback;
  return {
    first,
    last,
    startedAt: typeof r.startedAt === 'string' ? r.startedAt.slice(0, 40) : first.at,
    pages: int(r.pages, 1),
    sessions: int(r.sessions, 1),
  };
}
