import { NextResponse } from 'next/server';
import { postWpPhp, WpPhpError } from '@/lib/api/wp-php';
import { setSessionCustomer } from '@/lib/auth/session';
import type { AuthCustomer } from '@/lib/auth/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LoginPhpResponse = {
  ok?: boolean;
  message?: string;
  customer?: AuthCustomer;
};

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ code: 'invalid_json', message: 'Neispravan zahtev.' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '');
  const remember = body.remember === true;
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;

  if (!email || !password) {
    return NextResponse.json({ code: 'validation_error', message: 'Unesite e-mail i lozinku.' }, { status: 400 });
  }

  try {
    const data = await postWpPhp<LoginPhpResponse>('koncar-auth.php', {
      action: 'login',
      email,
      password,
    });
    const customer = data.customer;
    if (!customer?.id || !customer.email) {
      return NextResponse.json({ code: 'login_failed', message: 'Prijava nije uspela.' }, { status: 502 });
    }
    setSessionCustomer(
      {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName ?? '',
        lastName: customer.lastName ?? '',
        phone: customer.phone,
      },
      maxAge,
    );
    return NextResponse.json({ customer });
  } catch (error) {
    if (error instanceof WpPhpError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }
    console.error('[api/auth/login]', error);
    return NextResponse.json({ code: 'login_failed', message: 'Prijava nije uspela.' }, { status: 502 });
  }
}
