import { NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getOpportunityStatus } from '@/lib/opportunity-utils';

const PAGE_SIZE = 15;
const BATCH_SIZE = 40;
const LOOKAHEAD_PAGES = 1;

function cleanLikeTerm(value: string) {
  return value.replace(/[%_]/g, '').trim();
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const admin = getSupabaseAdmin() as any;
  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get('mode') || '').trim();

  if (mode === 'countries') {
    const { data, error } = await admin
      .from('opportunities')
      .select('country_or_region')
      .order('country_or_region', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const countries = Array.from(
      new Set(
        (data || [])
          .map((x: any) => String(x.country_or_region || '').trim())
          .filter(Boolean)
      )
    ).sort((a, b) => String(a).localeCompare(String(b))) as string[];

    return NextResponse.json({ countries });
  }

  const q = (searchParams.get('q') || '').trim();
  const selectedCategory = (searchParams.get('category') || 'All').trim();
  const selectedCountry = (searchParams.get('country') || 'All').trim();
  const sortBy = (searchParams.get('sort') || 'latest').trim();
  const statusFilter = searchParams.get('status') === 'Expired' ? 'Expired' : 'Active';
  const page = Math.max(1, Number(searchParams.get('page') || '1') || 1);

  const need = (page + LOOKAHEAD_PAGES) * PAGE_SIZE;
  const collected: any[] = [];

  let offset = 0;
  let safety = 0;
  let upstreamExhausted = false;

  while (collected.length < need && !upstreamExhausted && safety < 25) {
    safety += 1;

    let query = admin
      .from('opportunities')
      .select('*')
      .range(offset, offset + BATCH_SIZE - 1);

    if (selectedCountry !== 'All') {
      query = query.eq('country_or_region', selectedCountry);
    }

    if (selectedCategory !== 'All') {
      query = query.ilike('category', `%${selectedCategory}%`);
    }

    const cleaned = cleanLikeTerm(q.toLowerCase());
    if (cleaned) {
      const term = cleaned.replace(/,/g, ' ');
      query = query.or(`title.ilike.%${term}%,summary.ilike.%${term}%`);
    }

    if (sortBy === 'deadline') {
      query = query.order('deadline', { ascending: true });
    } else if (sortBy === 'latest') {
      query = query.order('date_added', { ascending: false });
    } else if (sortBy === 'title') {
      query = query.order('title', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const batch = data || [];
    if (batch.length < BATCH_SIZE) upstreamExhausted = true;

    const filteredByStatus = batch.filter((opp: any) => getOpportunityStatus(opp.deadline) === statusFilter);
    collected.push(...filteredByStatus);
    offset += BATCH_SIZE;

    if (batch.length === 0) upstreamExhausted = true;
  }

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const items = collected.slice(start, end);
  const hasNext = collected.length > end;

  return NextResponse.json({ items, hasNext });
}
