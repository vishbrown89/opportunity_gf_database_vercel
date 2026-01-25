import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function isPrivateHost(hostname: string) {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local')) return true;

  // Block obvious private ranges by hostname string (covers common cases)
  if (h === '127.0.0.1') return true;
  if (h === '0.0.0.0') return true;

  return false;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = (searchParams.get('url') || '').trim();

    if (!raw) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    let target: URL;
    try {
      target = new URL(raw);
    } catch {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
    }

    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
      return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
    }

    if (isPrivateHost(target.hostname)) {
      return NextResponse.json({ error: 'Blocked host' }, { status: 400 });
    }

    const upstream = await fetch(target.toString(), {
      headers: {
        // Looks more like a real browser fetch, helps some hosts
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      // Important: allow this to be cached by Vercel or your host
      cache: 'force-cache',
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') || 'image/*';
    const bytes = await upstream.arrayBuffer();

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}
