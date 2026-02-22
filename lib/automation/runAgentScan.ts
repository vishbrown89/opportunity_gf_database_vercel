import { scanOpportunitiesFromUrl, type ScanAgent, type ScannedOpportunity } from '@/lib/ai/extractOpportunity'
import { normalizeDeadline } from '@/lib/ai/normalize'
import { isDuplicateOpportunity } from '@/lib/opportunity/dedupe'
import { passesQualityGate } from '@/lib/opportunity/qualityGate'
import { normalizeCategory } from '@/lib/opportunity/category'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET || ''
  if (!secret) return false
  return (request.headers.get('authorization') || '') === `Bearer ${secret}`
}

function toDraftPayload(opportunity: ScannedOpportunity, agent: ScanAgent) {
  return {
    source_url: String(opportunity.official_source_url || '').trim(),
    title: String(opportunity.title || '').trim(),
    summary: String(opportunity.professional_summary || '').trim(),
    full_description: `${String(opportunity.professional_summary || '').trim()}\n\n${String(
      opportunity.why_it_matters_for_asean || ''
    ).trim()}`.trim(),
    eligibility: opportunity.eligible_asean_countries.join(', '),
    funding_or_benefits: String(opportunity.funding_amount || '').trim(),
    category: normalizeCategory(opportunity.opportunity_type),
    country_or_region: opportunity.eligible_asean_countries.join(', '),
    deadline: normalizeDeadline(opportunity.deadline) || null,
    tags: Array.isArray(opportunity.tags) ? opportunity.tags : [],
    logo_url: null,
    extraction_model: `gpt-4o-mini:${agent}`,
    extraction_error: null,
    status: 'pending',
    updated_at: new Date().toISOString()
  }
}

function partitionSourcesByAgent(sources: any[], agent: ScanAgent) {
  const desiredParity = agent === 'global_institutional_scan' ? 0 : 1
  const filtered = (sources || []).filter((source: any) => Number(source?.id || 0) % 2 === desiredParity)
  if (filtered.length > 0) return filtered
  return sources || []
}

export async function runAgentScan(request: Request, agent: ScanAgent) {
  if (!isAuthorized(request)) {
    return { status: 401, body: { error: 'Unauthorized' } }
  }

  const admin = getSupabaseAdmin() as any
  const { data: rawSources, error } = await admin
    .from('opportunity_sources')
    .select('*')
    .eq('active', true)
    .order('priority', { ascending: true })
    .order('last_processed_at', { ascending: true, nullsFirst: true })
    .limit(30)

  if (error) {
    return { status: 500, body: { error: error.message } }
  }

  const selectedSources = partitionSourcesByAgent(rawSources || [], agent).slice(0, 3)
  const processed: any[] = []
  let inserted = 0

  for (const source of selectedSources) {
    const sourceUrl = String(source?.source_url || '').trim()
    if (!sourceUrl) continue

    try {
      const scanned = await scanOpportunitiesFromUrl(sourceUrl, agent)
      const kept: any[] = []

      for (const opportunity of scanned) {
        if (inserted >= 5) break

        const gate = passesQualityGate(opportunity)
        if (!gate.ok) continue

        const duplicate = await isDuplicateOpportunity(admin, opportunity)
        if (duplicate) continue

        const payload = toDraftPayload(opportunity, agent)
        if (!payload.source_url || !payload.title || !payload.deadline) continue

        const { error: upsertError } = await admin
          .from('opportunity_drafts')
          .upsert(payload, { onConflict: 'source_url' })

        if (upsertError) throw upsertError

        kept.push({
          title: payload.title,
          source_url: payload.source_url,
          deadline: payload.deadline
        })
        inserted += 1
      }

      await admin
        .from('opportunity_sources')
        .update({ last_processed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', source.id)

      processed.push({ sourceUrl, ok: true, scanned: scanned.length, kept })
    } catch (e: any) {
      processed.push({ sourceUrl, ok: false, error: String(e?.message || e) })
    }

    if (inserted >= 5) break
  }

  return {
    status: 200,
    body: {
      ok: true,
      agent,
      selected_source_count: selectedSources.length,
      inserted,
      processed
    }
  }
}
