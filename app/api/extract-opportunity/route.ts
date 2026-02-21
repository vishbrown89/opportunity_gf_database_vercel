import { NextResponse } from 'next/server';

import { extractOpportunityFromUrl } from '@/lib/ai/extractOpportunity';
import { normalizeDeadline } from '@/lib/ai/normalize';

export const runtime = 'nodejs';

function json(data: unknown, status = 200) {
  return NextResponse.json(data as any, { status });
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json().catch(() => ({} as any));
    const cleanUrl = String(url || '').trim();

    if (!cleanUrl) return json({ error: 'URL is required' }, 400);

    const extracted = await extractOpportunityFromUrl(cleanUrl);
    return json({ ...extracted, deadline: normalizeDeadline(extracted.deadline) }, 200);
  } catch (e: any) {
    return json({ error: e?.message || String(e) }, 500);
  }
}
