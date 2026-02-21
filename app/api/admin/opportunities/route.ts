import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { verifyAdminSessionToken } from '@/lib/admin/session';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getAdminClient() {
  if (!supabaseUrl) throw new Error('Missing SUPABASE_URL');
  if (!supabaseServiceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function requireAdminSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session')?.value || '';
  return Boolean(verifyAdminSessionToken(token));
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/["']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    if (!requireAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    const body = await request.json();

    const title = String(body?.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const payload = {
      title,
      slug: String(body?.slug || '').trim() || slugify(title),
      category: String(body?.category || '').trim(),
      country_or_region: String(body?.country_or_region || '').trim(),
      deadline: String(body?.deadline || '').trim(),
      summary: String(body?.summary || '').trim(),
      full_description: body?.full_description ?? null,
      eligibility: body?.eligibility ?? null,
      funding_or_benefits: body?.funding_or_benefits ?? null,
      tags: Array.isArray(body?.tags) ? body.tags : [],
      source_url: String(body?.source_url || '').trim(),
      logo_url: body?.logo_url ? String(body.logo_url).trim() : null,
      featured: Boolean(body?.featured),
      date_added: body?.date_added ? String(body.date_added).trim() : new Date().toISOString().slice(0, 10),
    };

    const { data, error } = await supabase.from('opportunities').insert(payload).select().single();
    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!requireAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    const body = await request.json();

    const id = String(body?.id || '').trim();
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const title = body?.title ? String(body.title).trim() : '';
    const updateData: any = { ...body };
    delete updateData.id;

    if (title && !updateData.slug) {
      updateData.slug = slugify(title);
    }

    const { data, error } = await supabase.from('opportunities').update(updateData).eq('id', id).select().single();
    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!requireAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
