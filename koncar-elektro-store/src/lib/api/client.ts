import { wcConsumerKey, wcConsumerSecret } from '@/lib/api/config';
import { ApiError } from '@/lib/api/errors';

export type FetchJsonOptions = RequestInit & {
  /** Query params appended to URL */
  searchParams?: Record<string, string | number | boolean | undefined>;
  /** Use WooCommerce REST v3 Basic auth (server/scripts only — not for browser prod) */
  wcAuth?: boolean;
};

function buildUrl(base: string, path: string, searchParams?: FetchJsonOptions['searchParams']) {
  const normalized = `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const baseOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const url = new URL(normalized, baseOrigin);
  // Keep a trailing slash on the path so `trailingSlash: true` doesn't 308-redirect
  // each API call (WP REST accepts both forms).
  if (!url.pathname.endsWith('/')) {
    url.pathname = `${url.pathname}/`;
  }
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function wcBasicAuthHeader(): string {
  const token = btoa(`${wcConsumerKey}:${wcConsumerSecret}`);
  return `Basic ${token}`;
}

export async function fetchJson<T>(
  base: string,
  path: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const { searchParams, wcAuth, headers, ...init } = options;
  const url = buildUrl(base, path, searchParams);

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(wcAuth ? { Authorization: wcBasicAuthHeader() } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text().catch(() => undefined);
    }
    throw new ApiError(
      `API ${response.status}: ${response.statusText}`,
      response.status,
      url,
      body,
    );
  }

  return response.json() as Promise<T>;
}

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  totalPages: number;
};

/** Fetch with X-WP-Total / X-WP-TotalPages headers (WC REST v3, WP v2). */
export async function fetchJsonPaginated<T>(
  base: string,
  path: string,
  options: FetchJsonOptions = {},
): Promise<PaginatedResult<T>> {
  const { searchParams, wcAuth, headers, ...init } = options;
  const url = buildUrl(base, path, searchParams);

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(wcAuth ? { Authorization: wcBasicAuthHeader() } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(`API ${response.status}`, response.status, url);
  }

  const data = (await response.json()) as T[];
  return {
    data,
    total: Number(response.headers.get('X-WP-Total') ?? data.length),
    totalPages: Number(response.headers.get('X-WP-TotalPages') ?? 1),
  };
}
