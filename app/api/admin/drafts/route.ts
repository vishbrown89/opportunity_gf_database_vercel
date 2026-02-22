import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdminSessionToken } from '@/lib/admin/session';
import { generateSlug } from '@/lib/opportunity-utils';
import { normalizeCategory } from '@/lib/opportunity/category';

function requireAdmin() {
  const token = cookies().get('admin_session')?.value || '';
  const email = verifyAdminSessionToken(token);
  return email || null;
}

function toNullableText(value: unknown) {
  const text = String(value || '').trim();
  return text ? text : null;
}

function parseDraftId(rawValue: unknown) {
  const raw = String(rawValue ?? '').trim();
  if (!/^\d+$/.test(raw)) return null;
  return raw;
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
  const id = parseDraftId(body?.id);
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
      category: normalizeCategory(draft.category),
      country_or_region: String(draft.country_or_region || ''),
      deadline: draft.deadline ? String(draft.deadline) : null,
      summary: String(draft.summary || ''),
      full_description: toNullableText(draft.full_description),
      eligibility: toNullableText(draft.eligibility),
      funding_or_benefits: toNullableText(draft.funding_or_benefits),
      tags: Array.isArray(draft.tags) ? draft.tags : [],
      source_url: sourceUrl,
      logo_url: toNullableText(draft.logo_url),
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

export async function PUT(request: Request) {
  const adminEmail = requireAdmin();
  if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = getSupabaseAdmin() as any;
  const body = await request.json().catch(() => ({}));
  const id = parseDraftId(body?.id);
  const updates = body?.updates && typeof body.updates === 'object' ? body.updates : {};

  if (!id) {
    return NextResponse.json({ error: 'Invalid draft id' }, { status: 400 });
  }

  const payload: Record<string, any> = {};

  if ('title' in updates) payload.title = String(updates.title || '').trim();
  if ('source_url' in updates) payload.source_url = String(updates.source_url || '').trim();
  if ('category' in updates) payload.category = normalizeCategory(updates.category);
  if ('country_or_region' in updates) payload.country_or_region = String(updates.country_or_region || '').trim();
  if ('summary' in updates) payload.summary = String(updates.summary || '').trim();
  if ('deadline' in updates) payload.deadline = toNullableText(updates.deadline);

  if ('full_description' in updates) payload.full_description = toNullableText(updates.full_description);
  if ('eligibility' in updates) payload.eligibility = toNullableText(updates.eligibility);
  if ('funding_or_benefits' in updates) payload.funding_or_benefits = toNullableText(updates.funding_or_benefits);
  if ('logo_url' in updates) payload.logo_url = toNullableText(updates.logo_url);

  if ('tags' in updates) {
    if (!Array.isArray(updates.tags)) {
      return NextResponse.json({ error: 'tags must be an array' }, { status: 400 });
    }
    payload.tags = updates.tags.map((value: unknown) => String(value || '').trim()).filter(Boolean);
  }

  if ('status' in updates) {
    const nextStatus = String(updates.status || '').trim().toLowerCase();
    if (!['pending', 'approved', 'rejected'].includes(nextStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    payload.status = nextStatus;
  }

  if (!payload.title || !payload.source_url) {
    return NextResponse.json({ error: 'Title and Source URL are required' }, { status: 400 });
  }

  payload.updated_at = new Date().toISOString();

  const { data, error } = await admin
    .from('opportunity_drafts')
    .update(payload)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

  return NextResponse.json({ success: true, draft: data });
}
