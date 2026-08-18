import { cookies } from 'next/headers';
import type { AuthCustomer } from '@/lib/auth/types';
import {
  AUTH_COOKIE,
  DEFAULT_MAX_AGE_SEC,
  decodeSession,
  encodeSession,
  sessionCookieOptions,
} from '@/lib/auth/token';

export { AUTH_COOKIE, decodeSession, encodeSession, sessionCookieOptions };

export function getSessionCustomer(): AuthCustomer | null {
  return decodeSession(cookies().get(AUTH_COOKIE)?.value);
}

export function setSessionCustomer(
  customer: AuthCustomer,
  maxAgeSec = DEFAULT_MAX_AGE_SEC,
): void {
  cookies().set(AUTH_COOKIE, encodeSession(customer, maxAgeSec), sessionCookieOptions(maxAgeSec));
}

export function clearSessionCustomer(): void {
  cookies().set(AUTH_COOKIE, '', { ...sessionCookieOptions(0), maxAge: 0 });
}
