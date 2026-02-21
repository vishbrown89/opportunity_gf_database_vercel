import { NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { extractOpportunityFromUrl } from '@/lib/ai/extractOpportunity';
import { normalizeDeadline } from '@/lib/ai/normalize';

export const dynamic = 'force-dynamic';

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET || '';
  if (!secret) return false;
  return (request.headers.get('authorization') || '') === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getSupabaseAdmin() as any;
  const { data: sources, error } = await admin
    .from('opportunity_sources')
    .select('*')
    .eq('active', true)
    .order('priority', { ascending: true })
    .order('last_processed_at', { ascending: true, nullsFirst: true })
    .limit(2);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const processed: any[] = [];

  for (const source of sources || []) {
    const sourceUrl = String(source?.source_url || '').trim();
    if (!sourceUrl) continue;

    try {
      const extracted = await extractOpportunityFromUrl(sourceUrl);

      const payload = {
        source_url: sourceUrl,
        title: String(extracted.title || '').trim() || sourceUrl,
        summary: String(extracted.summary || '').trim(),
        full_description: String(extracted.full_description || '').trim(),
        eligibility: String(extracted.eligibility || '').trim(),
        funding_or_benefits: String(extracted.funding_or_benefits || '').trim(),
        category: String(extracted.category || '').trim(),
        country_or_region: String(extracted.country_or_region || '').trim(),
        deadline: normalizeDeadline(extracted.deadline) || null,
        tags: Array.isArray(extracted.tags) ? extracted.tags : [],
        logo_url: String(extracted.logo_url || '').trim() || null,
        extraction_model: 'gpt-4o-mini',
        extraction_error: null,
        status: 'pending',
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await admin
        .from('opportunity_drafts')
        .upsert(payload, { onConflict: 'source_url' });

      if (upsertError) throw upsertError;

      await admin
        .from('opportunity_sources')
        .update({ last_processed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', source.id);

      processed.push({ sourceUrl, ok: true });
    } catch (e: any) {
      await admin
        .from('opportunity_drafts')
        .upsert(
          {
            source_url: sourceUrl,
            title: sourceUrl,
            status: 'pending',
            extraction_error: String(e?.message || e || 'Unknown extraction error'),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'source_url' }
        );

      processed.push({ sourceUrl, ok: false, error: String(e?.message || e) });
    }
  }

  return NextResponse.json({ ok: true, processed });
}
