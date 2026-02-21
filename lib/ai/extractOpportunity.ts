import { normalizeDeadline } from '@/lib/ai/normalize'

export type ScanAgent = 'global_institutional_scan' | 'elite_foundation_scan'

export type ScannedOpportunity = {
  title: string
  institution: string
  opportunity_type: string
  funding_amount: string
  eligible_asean_countries: string[]
  deadline: string
  official_source_url: string
  professional_summary: string
  why_it_matters_for_asean: string
  quality_score: {
    brand_prestige: number
    funding_scale: number
    strategic_relevance_asean: number
    exclusivity: number
    deadline_clarity: number
    overall: number
  }
  flags: {
    rolling_open: boolean
    expired: boolean
    unclear_deadline: boolean
    aggregator_only: boolean
  }
  tags: string[]
}

export type ExtractedOpportunity = {
  title: string
  summary: string
  full_description: string
  eligibility: string
  funding_or_benefits: string
  category: string
  country_or_region: string
  deadline: string
  tags: string[]
  source_url: string
  logo_url: string
}

const AGENT_BRIEF: Record<ScanAgent, string> = {
  global_institutional_scan:
    'Focus on multilateral institutions, development agencies, government funds, and public international organizations.',
  elite_foundation_scan:
    'Focus on prestigious foundations, high-competition innovation funds, and elite fellowships.'
}

function cleanHtmlToText(html: string, limit: number) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, limit)
}

function safeJsonParse(raw: string) {
  try {
    return JSON.parse(raw)
  } catch {
    const objectMatch = raw.match(/\{[\s\S]*\}/)
    if (!objectMatch) {
      throw new Error('Failed to parse AI response as JSON')
    }
    return JSON.parse(objectMatch[0])
  }
}

function toNumber(value: unknown) {
  const n = Number(value)
  if (Number.isNaN(n)) return 0
  if (n < 0) return 0
  if (n > 5) return 5
  return n
}

function normalizeScannedOpportunity(raw: any, sourceUrl: string): ScannedOpportunity {
  return {
    title: String(raw?.title || '').trim(),
    institution: String(raw?.institution || '').trim(),
    opportunity_type: String(raw?.opportunity_type || '').trim(),
    funding_amount: String(raw?.funding_amount || '').trim(),
    eligible_asean_countries: Array.isArray(raw?.eligible_asean_countries)
      ? raw.eligible_asean_countries.map((x: unknown) => String(x).trim()).filter(Boolean)
      : [],
    deadline: normalizeDeadline(raw?.deadline),
    official_source_url: String(raw?.official_source_url || sourceUrl).trim() || sourceUrl,
    professional_summary: String(raw?.professional_summary || '').trim(),
    why_it_matters_for_asean: String(raw?.why_it_matters_for_asean || '').trim(),
    quality_score: {
      brand_prestige: toNumber(raw?.quality_score?.brand_prestige),
      funding_scale: toNumber(raw?.quality_score?.funding_scale),
      strategic_relevance_asean: toNumber(raw?.quality_score?.strategic_relevance_asean),
      exclusivity: toNumber(raw?.quality_score?.exclusivity),
      deadline_clarity: toNumber(raw?.quality_score?.deadline_clarity),
      overall: toNumber(raw?.quality_score?.overall)
    },
    flags: {
      rolling_open: Boolean(raw?.flags?.rolling_open),
      expired: Boolean(raw?.flags?.expired),
      unclear_deadline: Boolean(raw?.flags?.unclear_deadline),
      aggregator_only: Boolean(raw?.flags?.aggregator_only)
    },
    tags: Array.isArray(raw?.tags) ? raw.tags.slice(0, 5).map((x: unknown) => String(x).trim()).filter(Boolean) : []
  }
}

function buildPrompt(agent: ScanAgent, textContent: string, sourceUrl: string) {
  const today = new Date().toISOString().slice(0, 10)
  return `Agent: ${agent}
Scope: ${AGENT_BRIEF[agent]}
Today: ${today}
Source URL: ${sourceUrl}

You are a curated funding analyst, not a generic scraper.
Extract 0 to 5 opportunities from this page content.
Return opportunities ONLY if ALL are true:
- currently open
- clear submission deadline in YYYY-MM-DD
- deadline is after today and within 12 months
- at least one ASEAN country is eligible
- official credible source
- not rolling or permanently open
- not expired
- not repost aggregator content

Apply internal quality filter. Exclude anything with overall score below 4/5.
Scoring dimensions: brand_prestige, funding_scale, strategic_relevance_asean, exclusivity, deadline_clarity.

Return only valid JSON in this exact shape:
{
  "opportunities": [
    {
      "title": "string",
      "institution": "string",
      "opportunity_type": "string",
      "funding_amount": "string",
      "eligible_asean_countries": ["string"],
      "deadline": "YYYY-MM-DD",
      "official_source_url": "string",
      "professional_summary": "string",
      "why_it_matters_for_asean": "string",
      "quality_score": {
        "brand_prestige": 0,
        "funding_scale": 0,
        "strategic_relevance_asean": 0,
        "exclusivity": 0,
        "deadline_clarity": 0,
        "overall": 0
      },
      "flags": {
        "rolling_open": false,
        "expired": false,
        "unclear_deadline": false,
        "aggregator_only": false
      },
      "tags": ["string"]
    }
  ]
}

If nothing qualifies, return {"opportunities": []}.

Page content:
${textContent}`
}

async function runOpenAi(prompt: string) {
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a strict funding intelligence extractor. Return valid JSON only. Never include markdown or commentary.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1
    })
  })

  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text().catch(() => '')
    throw new Error(`Failed to call OpenAI API: ${openaiResponse.status}. ${errorText}`)
  }

  const openaiData = await openaiResponse.json()
  return String(openaiData?.choices?.[0]?.message?.content || '')
}

export async function scanOpportunitiesFromUrl(url: string, agent: ScanAgent): Promise<ScannedOpportunity[]> {
  const htmlResponse = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  })

  if (!htmlResponse.ok) {
    throw new Error(`Failed to fetch URL: ${htmlResponse.status} ${htmlResponse.statusText}`)
  }

  const html = await htmlResponse.text()
  const textContent = cleanHtmlToText(html, 12000)
  const prompt = buildPrompt(agent, textContent, url)
  const raw = await runOpenAi(prompt)
  const parsed = safeJsonParse(raw)

  const opportunities = Array.isArray(parsed?.opportunities) ? parsed.opportunities : []
  return opportunities.slice(0, 5).map((item: any) => normalizeScannedOpportunity(item, url))
}

// Backward-compatible single extraction for manual endpoint usage.
export async function extractOpportunityFromUrl(url: string): Promise<ExtractedOpportunity> {
  const scanned = await scanOpportunitiesFromUrl(url, 'global_institutional_scan')
  const first = scanned[0]

  if (!first) {
    return {
      title: '',
      summary: '',
      full_description: '',
      eligibility: '',
      funding_or_benefits: '',
      category: '',
      country_or_region: '',
      deadline: '',
      tags: [],
      source_url: url,
      logo_url: ''
    }
  }

  return {
    title: first.title,
    summary: first.professional_summary,
    full_description: `${first.professional_summary}\n\n${first.why_it_matters_for_asean}`.trim(),
    eligibility: first.eligible_asean_countries.join(', '),
    funding_or_benefits: first.funding_amount,
    category: first.opportunity_type,
    country_or_region: first.eligible_asean_countries.join(', '),
    deadline: first.deadline,
    tags: first.tags,
    source_url: first.official_source_url || url,
    logo_url: ''
  }
}
