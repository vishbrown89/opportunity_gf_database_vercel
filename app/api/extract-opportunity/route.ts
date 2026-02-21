import { NextResponse } from 'next/server'

import { extractOpportunityFromUrl, scanOpportunitiesFromUrl, type ScanAgent } from '@/lib/ai/extractOpportunity'
import { normalizeDeadline } from '@/lib/ai/normalize'

export const runtime = 'nodejs'

function json(data: unknown, status = 200) {
  return NextResponse.json(data as any, { status })
}

function toAgent(value: string): ScanAgent {
  if (value === 'elite_foundation_scan') return value
  return 'global_institutional_scan'
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const cleanUrl = String(body?.url || '').trim()
    const agent = toAgent(String(body?.agent || '').trim())

    if (!cleanUrl) return json({ error: 'URL is required' }, 400)

    if (body?.mode === 'scan') {
      const opportunities = await scanOpportunitiesFromUrl(cleanUrl, agent)
      return json({ agent, opportunities }, 200)
    }

    const extracted = await extractOpportunityFromUrl(cleanUrl)
    return json({ ...extracted, deadline: normalizeDeadline(extracted.deadline) }, 200)
  } catch (e: any) {
    return json({ error: e?.message || String(e) }, 500)
  }
}
