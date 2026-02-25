import { scanOpportunitiesFromUrl, type ScanAgent, type ScannedOpportunity } from '@/lib/ai/extractOpportunity'
import { normalizeDeadline } from '@/lib/ai/normalize'
import { notifyAdminsOnNewDrafts } from '@/lib/automation/adminAlert'
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

// Stable seed sources to keep scanner productive when search discovery yields weak/empty results.
const FALLBACK_SOURCE_URLS: Record<ScanAgent, string[]> = {
  global_institutional_scan: [
    'https://www.adb.org/work-with-us/careers',
    'https://www.unicef.org/careers',
    'https://www.undp.org/jobs',
    'https://www.worldbank.org/en/programs/youth-summit',
    'https://www.unesco.org/en/fellowships'
  ],
  elite_foundation_scan: [
    'https://www.mitacs.ca/our-programs/globalink-research-internship-students/',
    'https://www.skolkovo.ru/en/programmes/education/',
    'https://www.rockefellerfoundation.org/grants/',
    'https://www.mastercardfdn.org/all/scholars-program/',
    'https://www.opensocietyfoundations.org/grants'
  ]
}

type SourceCandidate = {
  id?: number | null
  source_url: string
  origin: 'db' | 'web_discovery' | 'fallback_seed'
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET || ''
  const authorization = request.headers.get('authorization') || ''
  if (secret) return authorization === `Bearer ${secret}`

  // Fallback to Vercel cron user-agent when CRON_SECRET is accidentally missing.
  const userAgent = String(request.headers.get('user-agent') || '').toLowerCase()
  return process.env.VERCEL === '1' && userAgent.includes('vercel-cron')
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

function normalizeSourceKey(rawUrl: string) {
  const cleaned = String(rawUrl || '').trim()
  if (!cleaned) return ''
  try {
    const url = new URL(cleaned)
    const normalizedPath = url.pathname.replace(/\/+$/, '') || '/'
    return `${url.protocol}//${url.host}${normalizedPath}`.toLowerCase()
  } catch {
    return cleaned.replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase()
  }
}

function dedupeSources(sources: SourceCandidate[]) {
  const seen = new Set<string>()
  const result: SourceCandidate[] = []

  for (const source of sources) {
    const sourceUrl = String(source?.source_url || '').trim()
    if (!sourceUrl) continue

    const key = normalizeSourceKey(sourceUrl)
    if (!key || seen.has(key)) continue

    seen.add(key)
    result.push({ ...source, source_url: sourceUrl })
  }

  return result
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

function normalizeScanCategories(opportunity: ScannedOpportunity) {
  const candidates = [
    String(opportunity.opportunity_type || '').trim(),
    ...(Array.isArray(opportunity.tags) ? opportunity.tags : []).map((item) => String(item || '').trim())
  ].filter(Boolean)

  const normalized = Array.from(new Set(candidates.map((item) => normalizeCategory(item)).filter(Boolean)))
  if (normalized.length > 0) return normalized.join(', ')
  return normalizeCategory(opportunity.opportunity_type)
}

function toDraftPayload(opportunity: ScannedOpportunity, agent: ScanAgent, sourcePageUrl: string) {
  const summary = String(opportunity.professional_summary || '').trim()
  const fullDescription = [
    String(opportunity.full_description || '').trim(),
    String(opportunity.why_it_matters_for_asean || '').trim(),
    String(opportunity.application_steps || '').trim(),
    String(opportunity.key_dates || '').trim()
  ]
    .filter(Boolean)
    .join('\n\n')

  return {
    source_url: toPerOpportunitySourceUrl(opportunity, sourcePageUrl),
    title: String(opportunity.title || '').trim(),
    summary,
    full_description: fullDescription || summary,
    eligibility: String(opportunity.eligibility_details || '').trim() || opportunity.eligible_asean_countries.join(', '),
    funding_or_benefits:
      String(opportunity.funding_or_benefits_details || '').trim() || String(opportunity.funding_amount || '').trim(),
    category: normalizeScanCategories(opportunity),
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

  if (href.startsWith('/url?') || href.startsWith('https://www.bing.com/url?')) {
    try {
      const asUrl = href.startsWith('http') ? new URL(href) : new URL(`https://www.bing.com${href}`)
      const target = asUrl.searchParams.get('u')
      return target ? decodeURIComponent(target) : ''
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

  function addMatch(rawHref: string) {
    const normalized = normalizeSearchResultUrl(rawHref)
    if (!normalized) return
    if (!looksLikeOpportunityPage(normalized)) return
    found.add(normalized)
  }

  function addDirectUrl(url: string) {
    const normalized = String(url || '').trim()
    if (!normalized) return
    if (!looksLikeOpportunityPage(normalized)) return
    found.add(normalized)
  }

  function collectCandidateHrefs(html: string) {
    const candidates: string[] = []
    const classMatches = Array.from(html.matchAll(/<a[^>]*class="[^"]*(?:result__a|b_algo)[^"]*"[^>]*href="([^"]+)"/gi))
    const genericMatches = Array.from(html.matchAll(/<a[^>]*href="([^"]+)"/gi))

    for (const match of classMatches) candidates.push(String(match[1] || ''))
    for (const match of genericMatches.slice(0, 180)) candidates.push(String(match[1] || ''))
    return candidates
  }

  function collectRssLinks(xml: string) {
    const matches = Array.from(xml.matchAll(/<link>([^<]+)<\/link>/gi))
    return matches
      .map((match) => String(match[1] || '').trim())
      .filter((url) => /^https?:\/\//i.test(url))
      .filter((url) => !url.includes('bing.com') && !url.includes('news.google.com'))
  }

  for (const query of queries) {
    if (found.size >= maxUrls) break

    const htmlEngines = [
      `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
      `https://www.bing.com/search?q=${encodeURIComponent(query)}`
    ]

    for (const searchUrl of htmlEngines) {
      if (found.size >= maxUrls) break
      try {
        const response = await fetch(searchUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })

        if (!response.ok) continue
        const html = await response.text()
        const candidates = collectCandidateHrefs(html)
        for (const href of candidates) {
          addMatch(href)
          if (found.size >= maxUrls) break
        }
      } catch {
        continue
      }
    }

    if (found.size >= maxUrls) break

    const rssFeeds = [
      `https://www.bing.com/search?format=rss&q=${encodeURIComponent(query)}`,
      `https://news.google.com/rss/search?q=${encodeURIComponent(query)}`
    ]

    for (const rssUrl of rssFeeds) {
      if (found.size >= maxUrls) break
      try {
        const response = await fetch(rssUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/rss+xml,application/xml,text/xml,*/*' }
        })
        if (!response.ok) continue

        const xml = await response.text()
        const links = collectRssLinks(xml)
        for (const link of links) {
          addDirectUrl(link)
          if (found.size >= maxUrls) break
        }
      } catch {
        continue
      }
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
    .slice(0, 5)
    .map((source: any) => ({
      id: Number(source?.id || 0) || null,
      source_url: String(source?.source_url || '').trim(),
      origin: 'db' as const
    }))
    .filter((source: SourceCandidate) => Boolean(source.source_url))

  const discoveryLimit = clampDiscoveryUrls(process.env.AI_SCAN_DISCOVERY_URLS)
  const discoveredUrls = await discoverWebSourceUrls(agent, discoveryLimit)
  const discoveredSources: SourceCandidate[] = discoveredUrls.map((url) => ({ source_url: url, origin: 'web_discovery' }))

  const fallbackSources: SourceCandidate[] = (FALLBACK_SOURCE_URLS[agent] || []).map((sourceUrl) => ({
    source_url: String(sourceUrl || '').trim(),
    origin: 'fallback_seed'
  }))

  const maxSourcesToProcess = clampSourcesToProcess(process.env.AI_SCAN_MAX_SOURCES)
  const selectedSources: SourceCandidate[] = dedupeSources([...dbSources, ...discoveredSources, ...fallbackSources]).slice(
    0,
    maxSourcesToProcess
  )

  const processed: any[] = []
  const alertDrafts: { title: string; source_url: string; deadline: string | null }[] = []
  let inserted = 0
  const targetInserts = clampTargetInserts(process.env.AI_SCAN_TARGET_INSERTS)

  for (const source of selectedSources) {
    const sourceUrl = String(source?.source_url || '').trim()
    if (!sourceUrl) continue

    try {
      const scanned = await scanOpportunitiesFromUrl(sourceUrl, agent)
      const kept: any[] = []
      let skippedQuality = 0
      let skippedDuplicate = 0
      let skippedInvalidPayload = 0

      for (const opportunity of scanned) {
        if (inserted >= targetInserts) break

        const gate = passesQualityGate(opportunity)
        if (!gate.ok) {
          skippedQuality += 1
          continue
        }

        const duplicate = await isDuplicateOpportunity(admin, opportunity)
        if (duplicate) {
          skippedDuplicate += 1
          continue
        }

        const payload = toDraftPayload(opportunity, agent, sourceUrl)
        if (!payload.source_url || !payload.title || !payload.deadline) {
          skippedInvalidPayload += 1
          continue
        }

        const { error: upsertError } = await admin.from('opportunity_drafts').upsert(payload, { onConflict: 'source_url' })

        if (upsertError) throw upsertError

        kept.push({
          title: payload.title,
          source_url: payload.source_url,
          deadline: payload.deadline
        })
        alertDrafts.push({
          title: payload.title,
          source_url: payload.source_url,
          deadline: payload.deadline
        })
        inserted += 1
      }

      await touchSourceRecord(admin, sourceUrl)

      processed.push({
        sourceUrl,
        source_origin: source.origin,
        ok: true,
        scanned: scanned.length,
        kept,
        skipped_quality: skippedQuality,
        skipped_duplicate: skippedDuplicate,
        skipped_invalid_payload: skippedInvalidPayload
      })
    } catch (e: any) {
      processed.push({ sourceUrl, source_origin: source.origin, ok: false, error: String(e?.message || e) })
    }

    if (inserted >= targetInserts) break
  }

  let adminAlert: any = { sent: false, reason: 'no_new_drafts' }
  if (alertDrafts.length > 0) {
    try {
      adminAlert = await notifyAdminsOnNewDrafts({ request, admin, agent, drafts: alertDrafts })
    } catch (e: any) {
      adminAlert = { sent: false, reason: 'send_failed', error: String(e?.message || e) }
    }
  }

  return {
    status: 200,
    body: {
      ok: true,
      agent,
      selected_source_count: selectedSources.length,
      db_source_count: dbSources.length,
      discovered_source_count: discoveredSources.length,
      fallback_source_count: fallbackSources.length,
      target_inserts: targetInserts,
      inserted,
      admin_alert: adminAlert,
      processed
    }
  }
}
