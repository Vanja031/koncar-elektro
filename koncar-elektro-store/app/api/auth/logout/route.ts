import { NextResponse } from 'next/server';
import { clearSessionCustomer } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  clearSessionCustomer();
  return NextResponse.json({ ok: true });
}
