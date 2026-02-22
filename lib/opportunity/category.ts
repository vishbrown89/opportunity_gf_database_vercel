import { CATEGORIES } from '@/lib/supabase'

const VALID_CATEGORIES = new Set<string>(CATEGORIES)

const CATEGORY_SYNONYMS: Array<{ pattern: RegExp; category: string }> = [
  { pattern: /job|vacanc|position|employment|career/i, category: 'Job' },
  { pattern: /intern/i, category: 'Internship' },
  { pattern: /grant|fund(ing)?\b|financial support/i, category: 'Grant' },
  { pattern: /scholar/i, category: 'Scholarship' },
  { pattern: /fellow/i, category: 'Fellowship' },
  { pattern: /award|prize/i, category: 'Award' },
  { pattern: /challenge|competition|contest|hackathon/i, category: 'Challenge' },
  { pattern: /conference|summit|forum/i, category: 'Conference' },
  { pattern: /research/i, category: 'Research Funding' },
  { pattern: /seminar|webinar/i, category: 'Seminar' },
  { pattern: /training|bootcamp|course|academy/i, category: 'Training' },
  { pattern: /volunteer/i, category: 'Volunteer' },
  { pattern: /workshop/i, category: 'Workshop' },
]

export function normalizeCategory(rawValue: unknown, fallback = 'Grant') {
  const raw = String(rawValue || '').trim()
  if (!raw) return fallback

  const direct = CATEGORIES.find((item) => item.toLowerCase() === raw.toLowerCase())
  if (direct) return direct

  for (const rule of CATEGORY_SYNONYMS) {
    if (rule.pattern.test(raw)) return rule.category
  }

  return VALID_CATEGORIES.has(fallback) ? fallback : 'Grant'
}

export function isValidCategory(rawValue: unknown) {
  return VALID_CATEGORIES.has(String(rawValue || '').trim())
}
