import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdminSessionToken } from '@/lib/admin/session';
import { generateSlug } from '@/lib/opportunity-utils';

function requireAdmin() {
  const token = cookies().get('admin_session')?.value || '';
  const email = verifyAdminSessionToken(token);
  return email || null;
}

export async function GET() {
  const adminEmail = requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = getSupabaseAdmin() as any;
  const { data, error } = await admin
    .from('opportunity_drafts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ drafts: data || [] });
}

export async function POST(request: Request) {
  const adminEmail = requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = getSupabaseAdmin() as any;
  const body = await request.json().catch(() => ({}));
  const id = Number(body?.id || 0);
  const action = String(body?.action || '').trim().toLowerCase();

  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { data: draft, error: draftError } = await admin
    .from('opportunity_drafts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (draftError) return NextResponse.json({ error: draftError.message }, { status: 500 });
  if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

  if (action === 'reject') {
    const { error } = await admin
      .from('opportunity_drafts')
      .update({ status: 'rejected', rejected_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const sourceUrl = String(draft.source_url || '').trim();
  const title = String(draft.title || '').trim();
  if (!sourceUrl || !title) {
    return NextResponse.json({ error: 'Draft is missing required fields' }, { status: 400 });
  }

  const { data: existing } = await admin
    .from('opportunities')
    .select('id')
    .eq('source_url', sourceUrl)
    .limit(1)
    .maybeSingle();

  if (!existing) {
    const payload = {
      title,
      slug: generateSlug(title),
      category: String(draft.category || ''),
      country_or_region: String(draft.country_or_region || ''),
      deadline: draft.deadline ? String(draft.deadline) : null,
      summary: String(draft.summary || ''),
      full_description: draft.full_description || null,
      eligibility: draft.eligibility || null,
      funding_or_benefits: draft.funding_or_benefits || null,
      tags: Array.isArray(draft.tags) ? draft.tags : [],
      source_url: sourceUrl,
      logo_url: draft.logo_url || null,
      featured: false,
      date_added: new Date().toISOString().slice(0, 10),
    };

    const { error: insertError } = await admin.from('opportunities').insert(payload);
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { error: approveError } = await admin
    .from('opportunity_drafts')
    .update({
      status: 'approved',
      approved_by: adminEmail,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (approveError) return NextResponse.json({ error: approveError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
