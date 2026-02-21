import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createAdminSessionToken } from '@/lib/admin/session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const plainPassword = String(password || '');

    if (!normalizedEmail || !plainPassword) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const admin = getSupabaseAdmin() as any;
    const { data: user, error } = await admin
      .from('admin_users')
      .select('email, password_hash')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!user?.password_hash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const ok = await bcrypt.compare(plainPassword, String(user.password_hash));
    if (!ok) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const sessionToken = createAdminSessionToken(normalizedEmail);
    const res = NextResponse.json({ success: true, email: normalizedEmail });

    res.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'An error occurred' }, { status: 500 });
  }
}
