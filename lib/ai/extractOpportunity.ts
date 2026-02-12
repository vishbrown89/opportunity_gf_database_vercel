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
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Failed to parse AI response as JSON')
    return JSON.parse(match[0])
  }
}

export async function extractOpportunityFromUrl(url: string) {
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const htmlResponse = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  })

  if (!htmlResponse.ok) {
    throw new Error(`Failed to fetch URL: ${htmlResponse.status} ${htmlResponse.statusText}`)
  }

  const html = await htmlResponse.text()
  const textContent = cleanHtmlToText(html, 8000)

  const prompt = `Extract opportunity information from the following webpage content and return it as JSON.

Webpage content:
${textContent}

Return a JSON object with these fields:
- title: The opportunity title
- summary: A 2-3 sentence summary
- full_description: Full description of the opportunity
- eligibility: Eligibility requirements
- funding_or_benefits: Funding details and benefits
- category: One of: Award, Challenge, Conference, Fellowship, Grant, Internship, Job, Research Funding, Scholarship, Seminar, Training, Volunteer, Workshop
- country_or_region: Geographic location
- deadline: Deadline date in YYYY-MM-DD format (estimate if not exact)
- tags: Array of relevant tags (max 5)
- source_url: The original URL (${url})
- logo_url: If you can identify an organization logo URL from the content, include it, otherwise leave empty

Return only valid JSON, no other text.`

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You extract structured opportunity information from webpage content. Always return valid JSON only.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    })
  })

  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text().catch(() => '')
    throw new Error(`Failed to call OpenAI API: ${openaiResponse.status}. ${errorText}`)
  }

  const openaiData = await openaiResponse.json()
  const extractedText = openaiData.choices?.[0]?.message?.content || ''

  const parsed = safeJsonParse(extractedText)

  const result: ExtractedOpportunity = {
    title: String(parsed.title || ''),
    summary: String(parsed.summary || ''),
    full_description: String(parsed.full_description || ''),
    eligibility: String(parsed.eligibility || ''),
    funding_or_benefits: String(parsed.funding_or_benefits || ''),
    category: String(parsed.category || ''),
    country_or_region: String(parsed.country_or_region || ''),
    deadline: String(parsed.deadline || ''),
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5).map(String) : [],
    source_url: String(parsed.source_url || url),
    logo_url: String(parsed.logo_url || '')
  }

  return result
}
