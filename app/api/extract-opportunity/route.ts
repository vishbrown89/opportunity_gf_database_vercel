import { NextRequest, NextResponse } from 'next/server'
import { extractOpportunityFromUrl } from '@/lib/ai/extractOpportunity'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const extractedData = await extractOpportunityFromUrl(url)
    return NextResponse.json(extractedData)
  } catch (error: any) {
    console.error('Error extracting opportunity:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to extract opportunity data' },
      { status: 500 }
    )
  }
}
