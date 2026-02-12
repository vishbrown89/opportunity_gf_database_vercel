import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function json(data: unknown, status = 200) {
  return NextResponse.json(data as any, { status });
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json().catch(() => ({} as any));
    const cleanUrl = String(url || '').trim();

    if (!cleanUrl) {
      return json({ error: 'URL is required' }, 400);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return json(
        {
          error: 'Missing Supabase env vars',
          details:
            'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set',
        },
        500
      );
    }

    const fnUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/extract-opportunity`;

    const resp = await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ url: cleanUrl }),
    });

    const raw = await resp.text().catch(() => '');
    const contentType = resp.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!resp.ok) {
      let details: any = raw;
      if (isJson) {
        try {
          details = JSON.parse(raw);
        } catch {}
      }

      const message =
        (details && (details.error || details.message)) ||
        'Failed to extract opportunity data';

      return json(
        {
          error: message,
          status: resp.status,
          details,
        },
        500
      );
    }

    if (isJson) {
      try {
        const data = JSON.parse(raw);
        return json(data, 200);
      } catch {
        return json(
          { error: 'Function returned invalid JSON', details: raw },
          500
        );
      }
    }

    return json({ error: 'Function did not return JSON', details: raw }, 500);
  } catch (e: any) {
    return json({ error: e?.message || String(e) }, 500);
  }
}
