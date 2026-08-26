/**
 * Server-only WooCommerce REST API v3 helper.
 *
 * Uses query-string auth (`consumer_key` / `consumer_secret`) — many hosts
 * strip the Authorization header and WooCommerce documents this as the
 * reliable alternative.
 */
import dns from 'node:dns';
import { serverWcStoreApiBase } from '@/lib/api/server-config';

dns.setDefaultResultOrder('ipv4first');

export class WcRestError extends Error {
  status: number;
  body: unknown;
  code?: string;

  constructor(message: string, status: number, body: unknown, code?: string) {
    super(message);
    this.name = 'WcRestError';
    this.status = status;
    this.body = body;
    this.code = code;
  }
}

export function wcV3Base(): string {
  return serverWcStoreApiBase.replace(/\/wc\/store\/v1$/, '/wc/v3');
}

function credentials(): { key: string; secret: string } {
  const key =
    process.env.WC_CONSUMER_KEY ||
    process.env.NEXT_PUBLIC_WC_CONSUMER_KEY ||
    '';
  const secret =
    process.env.WC_CONSUMER_SECRET ||
    process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET ||
    '';
  if (!key || !secret) {
    throw new Error('Missing WC_CONSUMER_KEY / WC_CONSUMER_SECRET (server-only) env vars.');
  }
  return { key, secret };
}

function isTimeoutError(error: unknown): boolean {
  const cause = error instanceof Error ? (error as Error & { cause?: { code?: string } }).cause : undefined;
  return (
    cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
    (error instanceof Error && /timeout|timed out|fetch failed/i.test(error.message))
  );
}

function wrapFetchError(error: unknown): WcRestError {
  const cause = error instanceof Error ? (error as Error & { cause?: { code?: string } }).cause : undefined;
  const timedOut = isTimeoutError(error);
  return new WcRestError(
    timedOut
      ? 'Veza sa prodavnicom je istekla. Pokušajte ponovo za koji trenutak.'
      : 'Prodavnica trenutno nije dostupna. Pokušajte ponovo.',
    504,
    { cause: cause?.code ?? (error instanceof Error ? error.message : String(error)) },
    timedOut ? 'wp_timeout' : 'wp_unreachable',
  );
}

async function fetchWp(url: string, init: RequestInit): Promise<Response> {
  // Default to no-store for mutations / API routes. Callers on ISR pages must
  // pass `next: { revalidate }` (or an explicit cache) — otherwise Next.js throws
  // "Page changed from static to dynamic at runtime" on product PDPs.
  const next = (init as RequestInit & { next?: unknown }).next;
  const hasExplicitCachePolicy = init.cache !== undefined || next !== undefined;

  const request: RequestInit = {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.method && init.method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
    ...(hasExplicitCachePolicy ? {} : { cache: 'no-store' as RequestCache }),
  };
  try {
    return await fetch(url, request);
  } catch (error) {
    if (!isTimeoutError(error)) throw error;
    return await fetch(url, request);
  }
}

export async function wcV3Fetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { key, secret } = credentials();
  const base = wcV3Base().replace(/\/$/, '');
  const url = new URL(`${base}/${path.replace(/^\//, '')}`);
  if (!url.pathname.endsWith('/')) {
    url.pathname = `${url.pathname}/`;
  }
  url.searchParams.set('consumer_key', key);
  url.searchParams.set('consumer_secret', secret);

  let response: Response;
  try {
    response = await fetchWp(url.toString(), init);
  } catch (error) {
    throw wrapFetchError(error);
  }

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
    const message =
      (record && typeof record.message === 'string' ? record.message : null) ||
      `WC REST API v3 ${response.status}`;
    const code = record && typeof record.code === 'string' ? record.code : undefined;
    throw new WcRestError(message, response.status, body, code);
  }

  return body as T;
}
