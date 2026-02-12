import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const ADMIN_EMAIL = 'admin@growthforum.my'
    const ADMIN_PASSWORD = 'password123'

    const ok = email === ADMIN_EMAIL && password === ADMIN_PASSWORD

    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const res = NextResponse.json({ success: true, email: ADMIN_EMAIL })

    res.cookies.set('admin_session', 'true', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
