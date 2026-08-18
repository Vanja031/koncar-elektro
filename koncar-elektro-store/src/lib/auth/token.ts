import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AuthCustomer, AuthSessionPayload } from '@/lib/auth/types';

export const AUTH_COOKIE = 'koncar_session';
export const DEFAULT_MAX_AGE_SEC = 60 * 60 * 24 * 30;

function signingKey(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.WC_CONSUMER_SECRET ||
    process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET ||
    ''
  );
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(encodedPayload: string): string {
  const key = signingKey();
  if (!key) throw new Error('Missing AUTH_SECRET / WC_CONSUMER_SECRET for session signing.');
  return createHmac('sha256', key).update(encodedPayload).digest('base64url');
}

function signaturesMatch(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function encodeSession(customer: AuthCustomer, maxAgeSec = DEFAULT_MAX_AGE_SEC): string {
  const payload: AuthSessionPayload = {
    ...customer,
    exp: Math.floor(Date.now() / 1000) + maxAgeSec,
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export function decodeSession(token: string | undefined | null): AuthCustomer | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  try {
    if (!signaturesMatch(sign(encoded), signature)) return null;
    const payload = JSON.parse(fromBase64Url(encoded)) as AuthSessionPayload;
    if (!payload?.id || !payload.email || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      id: payload.id,
      email: payload.email,
      firstName: payload.firstName ?? '',
      lastName: payload.lastName ?? '',
      phone: payload.phone,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSec = DEFAULT_MAX_AGE_SEC) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSec,
  };
}
