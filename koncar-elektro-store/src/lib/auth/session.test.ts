import { describe, it, expect, beforeEach } from 'vitest';
import { decodeSession, encodeSession } from '@/lib/auth/token';

describe('auth session', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret-key';
  });

  it('round-trips a customer payload', () => {
    const token = encodeSession({
      id: 12,
      email: 'kupac@example.rs',
      firstName: 'Marko',
      lastName: 'Petrović',
      phone: '061 111 222',
    });
    expect(decodeSession(token)).toEqual({
      id: 12,
      email: 'kupac@example.rs',
      firstName: 'Marko',
      lastName: 'Petrović',
      phone: '061 111 222',
    });
  });

  it('rejects a tampered token', () => {
    const token = encodeSession({
      id: 1,
      email: 'a@b.rs',
      firstName: 'A',
      lastName: 'B',
    });
    expect(decodeSession(`${token}x`)).toBeNull();
  });
});
