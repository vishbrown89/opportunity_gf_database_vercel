import type { ScannedOpportunity } from '@/lib/ai/extractOpportunity'

const ASEAN_COUNTRIES = new Set([
  'brunei',
  'cambodia',
  'indonesia',
  'laos',
  'malaysia',
  'myanmar',
  'philippines',
  'singapore',
  'thailand',
  'timor-leste',
  'timor leste',
  'vietnam',
  'viet nam'
])

const AGGREGATOR_HINTS = ['opportunitydesk', 'fundsforngos', 'devex', 'scholarshipsads', 'allopportunities']

function hasAseanCountry(eligibleCountries: string[]) {
  return eligibleCountries.some((country) => ASEAN_COUNTRIES.has(country.toLowerCase().trim()))
}

function isWithin12Months(deadline: string) {
  if (!deadline || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return false

  const today = new Date()
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const due = new Date(`${deadline}T00:00:00Z`)
  if (Number.isNaN(due.getTime())) return false

  const max = new Date(start)
  max.setUTCDate(max.getUTCDate() + 365)

  return due > start && due <= max
}

function looksLikeAggregator(url: string) {
  const lower = url.toLowerCase()
  return AGGREGATOR_HINTS.some((hint) => lower.includes(hint))
}

export function passesQualityGate(opportunity: ScannedOpportunity) {
  const reasons: string[] = []

  if (!opportunity.title) reasons.push('missing_title')
  if (!opportunity.institution) reasons.push('missing_institution')
  if (!isWithin12Months(opportunity.deadline)) reasons.push('deadline_invalid_or_out_of_range')
  if (!hasAseanCountry(opportunity.eligible_asean_countries)) reasons.push('no_asean_eligibility')

  if (opportunity.flags.rolling_open) reasons.push('rolling_open')
  if (opportunity.flags.expired) reasons.push('expired')
  if (opportunity.flags.unclear_deadline) reasons.push('unclear_deadline')
  if (opportunity.flags.aggregator_only) reasons.push('aggregator_only_flag')
  if (looksLikeAggregator(opportunity.official_source_url)) reasons.push('aggregator_url')

  if (opportunity.quality_score.overall < 4) reasons.push('quality_below_4')

  return {
    ok: reasons.length === 0,
    reasons
  }
}
