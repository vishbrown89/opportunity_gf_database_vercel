import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const htmlResponse = await fetch(url);
    const html = await htmlResponse.text();

    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000);

    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

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

Return only valid JSON, no other text.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts structured opportunity information from webpage content. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error('Failed to call OpenAI API');
    }

    const openaiData = await openaiResponse.json();
    const extractedText = openaiData.choices[0]?.message?.content || '';

    let extractedData;
    try {
      extractedData = JSON.parse(extractedText);
    } catch (parseError) {
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    return NextResponse.json(extractedData);
  } catch (error: any) {
    console.error('Error extracting opportunity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract opportunity data' },
      { status: 500 }
    );
  }
}