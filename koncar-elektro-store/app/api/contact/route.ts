import { NextResponse } from 'next/server';
import { postWpPhp, WpPhpError } from '@/lib/api/wp-php';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ code: 'invalid_json', message: 'Neispravan zahtev.' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const message = String(body.message ?? '').trim();
  const website = String(body.website ?? '').trim();

  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !email || !message) {
    return NextResponse.json(
      { code: 'validation_error', message: 'Ime, email i poruka su obavezni.' },
      { status: 400 },
    );
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ code: 'validation_error', message: 'Neispravan email.' }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ code: 'validation_error', message: 'Poruka je predugačka.' }, { status: 400 });
  }

  try {
    await postWpPhp('contact.php', { name, email, phone, message, website });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof WpPhpError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }
    console.error('[api/contact]', error);
    return NextResponse.json(
      { code: 'contact_failed', message: 'Slanje poruke nije uspelo. Pokušajte telefonom ili emailom.' },
      { status: 502 },
    );
  }
}
