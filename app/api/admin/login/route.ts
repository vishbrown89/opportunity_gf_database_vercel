import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Hardcoded admin credentials
    const ADMIN_EMAIL = 'admin@growthforum.my';
    const ADMIN_PASSWORD = 'password123';

    const ok = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;

    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, email: ADMIN_EMAIL });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
