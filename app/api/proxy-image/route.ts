import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = (searchParams.get('url') || '').trim();

    if (!raw) {
      return new NextResponse('Missing url', { status: 400 });
    }

    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
      return new NextResponse('Invalid url', { status: 400 });
    }

    const upstream = await fetch(raw, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    if (!upstream.ok) {
      return new NextResponse(`Upstream error: ${upstream.status}`, { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') || 'image/*';
    const arrayBuffer = await upstream.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new NextResponse('Proxy failed', { status: 500 });
  }
}
