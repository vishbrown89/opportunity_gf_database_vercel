import { scanOpportunitiesFromUrl, type ScanAgent, type ScannedOpportunity } from '@/lib/ai/extractOpportunity'
import { normalizeDeadline } from '@/lib/ai/normalize'
import { isDuplicateOpportunity } from '@/lib/opportunity/dedupe'
import { passesQualityGate } from '@/lib/opportunity/qualityGate'
import { normalizeCategory } from '@/lib/opportunity/category'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const AGGREGATOR_HINTS = ['opportunitydesk', 'fundsforngos', 'devex', 'scholarshipsads', 'allopportunities']
const BLOCKED_HOST_HINTS = [
  ...AGGREGATOR_HINTS,
  'google.com',
  'bing.com',
  'duckduckgo.com',
  'facebook.com',
  'instagram.com',
  'x.com',
  'twitter.com',
  'youtube.com',
  'linkedin.com',
  'wikipedia.org'
]

const DISCOVERY_QUERIES: Record<ScanAgent, string[]> = {
  global_institutional_scan: [
    'site:.org grant call for proposals ASEAN deadline 2026',
    'development bank fellowship program ASEAN apply deadline',
    'UN agency innovation challenge ASEAN submissions deadline',
    'government fund call proposals Southeast Asia deadline'
  ],
  elite_foundation_scan: [
    'foundation fellowship Asia application deadline 2026',
    'global innovation prize foundation call deadline ASEAN',
    'research grant foundation Southeast Asia deadline',
    'elite scholarship fellowship Asia deadline apply'
  ]
}

type SourceCandidate = {
  id?: number | null
  source_url: string
  origin: 'db' | 'web_discovery'
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET || ''
  if (!secret) return false
  return (request.headers.get('authorization') || '') === `Bearer ${secret}`
}

function clampTargetInserts(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 2
  const rounded = Math.floor(parsed)
  if (rounded < 1) return 1
  if (rounded > 5) return 5
  return rounded
}

function clampDiscoveryUrls(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 12
  const rounded = Math.floor(parsed)
  if (rounded < 2) return 2
  if (rounded > 30) return 30
  return rounded
}

function clampSourcesToProcess(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 15
  const rounded = Math.floor(parsed)
  if (rounded < 3) return 3
  if (rounded > 40) return 40
  return rounded
}

function slugifyFragment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 72)
}

function toPerOpportunitySourceUrl(opportunity: ScannedOpportunity, sourcePageUrl: string) {
  const official = String(opportunity.official_source_url || '').trim()
  const base = official || sourcePageUrl
  if (!base) return ''

  // If extractor returns page-level URL, create a deterministic fragment so multiple
  // opportunities from the same source page can coexist.
  if (base === sourcePageUrl) {
    const titlePart = slugifyFragment(opportunity.title || 'opportunity')
    const due = String(opportunity.deadline || '').trim() || 'undated'
    const anchor = `${titlePart}-${due}`
    const separator = base.includes('#') ? '-' : '#'
    return `${base}${separator}opp-${anchor}`
  }

  return base
}

function toDraftPayload(opportunity: ScannedOpportunity, agent: ScanAgent, sourcePageUrl: string) {
  return {
    source_url: toPerOpportunitySourceUrl(opportunity, sourcePageUrl),
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

function normalizeSearchResultUrl(raw: string) {
  const href = String(raw || '').trim()
  if (!href) return ''

  if (href.startsWith('//')) return `https:${href}`
  if (/^https?:\/\//i.test(href)) return href
  if (href.startsWith('/l/?') || href.startsWith('https://duckduckgo.com/l/?')) {
    try {
      const asUrl = href.startsWith('http') ? new URL(href) : new URL(`https://duckduckgo.com${href}`)
      const uddg = asUrl.searchParams.get('uddg')
      return uddg ? decodeURIComponent(uddg) : ''
    } catch {
      return ''
    }
  }

  return ''
}

function looksLikeOpportunityPage(url: string) {
  const lower = url.toLowerCase()
  if (!/^https?:\/\//.test(lower)) return false
  if (BLOCKED_HOST_HINTS.some((hint) => lower.includes(hint))) return false

  const indicators = [
    'grant',
    'fellowship',
    'scholarship',
    'call-for-proposals',
    'call_for_proposals',
    'call',
    'apply',
    'application',
    'funding',
    'challenge',
    'programme',
    'program'
  ]

  return indicators.some((token) => lower.includes(token))
}

async function discoverWebSourceUrls(agent: ScanAgent, maxUrls: number) {
  const found = new Set<string>()
  const queries = DISCOVERY_QUERIES[agent] || []

  for (const query of queries) {
    if (found.size >= maxUrls) break

    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    if (!response.ok) continue
    const html = await response.text()

    const matches = Array.from(html.matchAll(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"/gi))
    for (const match of matches) {
      const normalized = normalizeSearchResultUrl(match[1] || '')
      if (!normalized) continue
      if (!looksLikeOpportunityPage(normalized)) continue

      found.add(normalized)
      if (found.size >= maxUrls) break
    }
  }

  return Array.from(found)
}

async function touchSourceRecord(admin: any, sourceUrl: string) {
  const now = new Date().toISOString()
  await admin
    .from('opportunity_sources')
    .upsert(
      {
        source_url: sourceUrl,
        active: true,
        priority: 200,
        last_processed_at: now,
        updated_at: now
      },
      { onConflict: 'source_url' }
    )
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

  const dbSources = partitionSourcesByAgent(rawSources || [], agent)
    .slice(0, 3)
    .map((source: any) => ({
      id: Number(source?.id || 0) || null,
      source_url: String(source?.source_url || '').trim(),
      origin: 'db' as const
    }))
    .filter((source: SourceCandidate) => Boolean(source.source_url))

  const discoveryLimit = clampDiscoveryUrls(process.env.AI_SCAN_DISCOVERY_URLS)
  const discoveredUrls = await discoverWebSourceUrls(agent, discoveryLimit)
  const dbUrlSet = new Set(dbSources.map((source: SourceCandidate) => source.source_url))
  const discoveredSources: SourceCandidate[] = discoveredUrls
    .filter((url) => !dbUrlSet.has(url))
    .map((url) => ({ source_url: url, origin: 'web_discovery' }))

  const maxSourcesToProcess = clampSourcesToProcess(process.env.AI_SCAN_MAX_SOURCES)
  const selectedSources: SourceCandidate[] = [...dbSources, ...discoveredSources].slice(0, maxSourcesToProcess)

  const processed: any[] = []
  let inserted = 0
  const targetInserts = clampTargetInserts(process.env.AI_SCAN_TARGET_INSERTS)

  for (const source of selectedSources) {
    const sourceUrl = String(source?.source_url || '').trim()
    if (!sourceUrl) continue

    try {
      const scanned = await scanOpportunitiesFromUrl(sourceUrl, agent)
      const kept: any[] = []

      for (const opportunity of scanned) {
        if (inserted >= targetInserts) break

        const gate = passesQualityGate(opportunity)
        if (!gate.ok) continue

        const duplicate = await isDuplicateOpportunity(admin, opportunity)
        if (duplicate) continue

        const payload = toDraftPayload(opportunity, agent, sourceUrl)
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

      await touchSourceRecord(admin, sourceUrl)

      processed.push({ sourceUrl, source_origin: source.origin, ok: true, scanned: scanned.length, kept })
    } catch (e: any) {
      processed.push({ sourceUrl, source_origin: source.origin, ok: false, error: String(e?.message || e) })
    }

    if (inserted >= targetInserts) break
  }

  return {
    status: 200,
    body: {
      ok: true,
      agent,
      selected_source_count: selectedSources.length,
      db_source_count: dbSources.length,
      discovered_source_count: discoveredSources.length,
      target_inserts: targetInserts,
      inserted,
      processed
    }
  }
}
