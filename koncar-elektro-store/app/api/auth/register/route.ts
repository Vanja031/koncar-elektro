import { NextResponse } from 'next/server';
import { createWcCustomer, isExistingCustomerError } from '@/lib/api/wc-rest/customers';
import { WcRestError } from '@/lib/api/wc-rest/client';
import { setSessionCustomer } from '@/lib/auth/session';
import type { AuthCustomer } from '@/lib/auth/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ code: 'invalid_json', message: 'Neispravan zahtev.' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const firstName = String(body.firstName ?? '').trim();
  const lastName = String(body.lastName ?? '').trim();
  const phone = String(body.phone ?? '').trim();

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json({ code: 'validation_error', message: 'Popunite sva obavezna polja.' }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ code: 'validation_error', message: 'Unesite ispravnu e-mail adresu.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ code: 'validation_error', message: 'Lozinka mora imati najmanje 8 karaktera.' }, { status: 400 });
  }

  try {
    const created = await createWcCustomer({ email, password, firstName, lastName, phone });
    const customer: AuthCustomer = {
      id: created.id,
      email: created.email,
      firstName: created.first_name || firstName,
      lastName: created.last_name || lastName,
      phone: created.billing?.phone || phone,
    };
    setSessionCustomer(customer);
    return NextResponse.json({ customer });
  } catch (error) {
    if (isExistingCustomerError(error)) {
      return NextResponse.json(
        { code: 'email_exists', message: 'Nalog sa ovom e-mail adresom već postoji. Prijavite se.' },
        { status: 409 },
      );
    }
    if (error instanceof WcRestError) {
      return NextResponse.json(
        { code: error.code || 'wc_error', message: stripHtml(error.message) || 'Registracija nije uspela.' },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }
    console.error('[api/auth/register]', error);
    return NextResponse.json(
      { code: 'register_failed', message: 'Registracija nije uspela. Pokušajte ponovo.' },
      { status: 502 },
    );
  }
}
