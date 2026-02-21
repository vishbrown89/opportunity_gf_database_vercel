import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verifyAdminSessionToken } from '@/lib/admin/session';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session')?.value || '';
  const email = verifyAdminSessionToken(token);

  if (!email) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, email });
}
