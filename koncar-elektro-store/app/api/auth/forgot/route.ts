import { NextResponse } from 'next/server';
import { postWpPhp, WpPhpError } from '@/lib/api/wp-php';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ code: 'invalid_json', message: 'Neispravan zahtev.' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim();
  if (!email) {
    return NextResponse.json({ code: 'validation_error', message: 'Unesite e-mail.' }, { status: 400 });
  }

  try {
    await postWpPhp('koncar-auth.php', { action: 'forgot', email });
  } catch (error) {
    if (error instanceof WpPhpError && error.code === 'php_missing') {
      return NextResponse.json({ code: error.code, message: error.message }, { status: 503 });
    }
  }

  return NextResponse.json({
    ok: true,
    message: 'Ako nalog postoji, poslali smo link za reset lozinke na vaš e-mail.',
  });
}
