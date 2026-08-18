import { NextResponse } from 'next/server';
import { getSessionCustomer } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const customer = getSessionCustomer();
  return NextResponse.json({ customer });
}
