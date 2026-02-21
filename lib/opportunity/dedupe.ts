import type { ScannedOpportunity } from '@/lib/ai/extractOpportunity'

function normalizeKeyPart(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function buildFingerprint(opportunity: ScannedOpportunity) {
  return `${normalizeKeyPart(opportunity.title)}|${normalizeKeyPart(opportunity.institution)}|${opportunity.deadline}`
}

export async function isDuplicateOpportunity(admin: any, opportunity: ScannedOpportunity) {
  const sourceUrl = String(opportunity.official_source_url || '').trim()
  if (sourceUrl) {
    const bySource = await admin.from('opportunity_drafts').select('id').eq('source_url', sourceUrl).limit(1)
    if (bySource.data?.length) return true
  }

  const byTitleAndDeadline = await admin
    .from('opportunity_drafts')
    .select('id')
    .eq('title', opportunity.title)
    .eq('deadline', opportunity.deadline)
    .limit(1)

  return Boolean(byTitleAndDeadline.data?.length)
}
