import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  linkedinUrl: z.string().trim().url().max(500),
  resumeUrl: z.string().trim().url().max(500).optional().or(z.literal('')),
  processingConsent: z.literal(true),
  newsletterConsent: z.boolean().default(false),
  sourcePage: z.string().trim().max(120).optional(),
});

type RankedOpportunity = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  country_or_region: string | null;
  deadline: string | null;
  source_url: string | null;
  score: number;
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(value: string) {
  return Array.from(
    new Set(
      normalizeText(value)
        .split(' ')
        .map((token) => token.trim())
        .filter((token) => token.length >= 3)
    )
  );
}

function overlapCount(a: string[], b: string[]) {
  if (!a.length || !b.length) return 0;
  const bSet = new Set(b);
  let count = 0;
  for (const token of a) {
    if (bSet.has(token)) count += 1;
  }
  return count;
}

function scoreByKeywords(profileTokens: string[], row: any) {
  const titleTokens = tokenize(String(row.title || ''));
  const summaryTokens = tokenize(String(row.summary || ''));
  const categoryTokens = tokenize(String(row.category || ''));
  const regionTokens = tokenize(String(row.country_or_region || ''));
  const tagTokens = Array.isArray(row.tags) ? tokenize(row.tags.join(' ')) : [];
  const eligibilityTokens = tokenize(String(row.eligibility || ''));

  const score =
    overlapCount(profileTokens, titleTokens) * 6 +
    overlapCount(profileTokens, categoryTokens) * 4 +
    overlapCount(profileTokens, tagTokens) * 3 +
    overlapCount(profileTokens, summaryTokens) * 2 +
    overlapCount(profileTokens, eligibilityTokens) * 2 +
    overlapCount(profileTokens, regionTokens);

  return score;
}

function rankByFallback(profileText: string, opportunities: any[]): RankedOpportunity[] {
  const profileTokens = tokenize(profileText);
  const withScore = opportunities.map((row) => ({
    id: String(row.id || ''),
    slug: String(row.slug || ''),
    title: String(row.title || ''),
    summary: row.summary ? String(row.summary) : null,
    category: row.category ? String(row.category) : null,
    country_or_region: row.country_or_region ? String(row.country_or_region) : null,
    deadline: row.deadline ? String(row.deadline) : null,
    source_url: row.source_url ? String(row.source_url) : null,
    score: scoreByKeywords(profileTokens, row),
  }));

  const positive = withScore
    .filter((item) => item.id && item.slug && item.title)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  if (positive.length >= 4) return positive;

  return withScore
    .filter((item) => item.id && item.slug && item.title)
    .sort((a, b) => {
      const aDate = Date.parse(String(a.deadline || '')) || 0;
      const bDate = Date.parse(String(b.deadline || '')) || 0;
      return aDate - bDate;
    })
    .slice(0, 8);
}

function extractJsonObject(raw: string) {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function rankByAi(profileText: string, opportunities: any[]): Promise<string[] | null> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) return null;

  const compact = opportunities.slice(0, 120).map((item) => ({
    id: String(item.id || ''),
    title: String(item.title || ''),
    category: String(item.category || ''),
    country_or_region: String(item.country_or_region || ''),
    summary: String(item.summary || '').slice(0, 260),
    tags: Array.isArray(item.tags) ? item.tags.slice(0, 8) : [],
    eligibility: String(item.eligibility || '').slice(0, 180),
  }));

  const prompt = [
    'You rank opportunities for a user profile.',
    'Return JSON only with shape: {"ids": ["id1","id2", ... up to 8]}.',
    'Use only IDs from the provided opportunities.',
    'Prioritize relevance to profile skills/interests/region and practical fit.',
    `Profile Context: ${profileText.slice(0, 6000)}`,
    `Opportunities: ${JSON.stringify(compact)}`,
  ].join('\n\n');

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a strict ranking engine. Return valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!openaiResponse.ok) return null;

  const openaiData = await openaiResponse.json().catch(() => null);
  const raw = String(openaiData?.choices?.[0]?.message?.content || '');
  const parsed = extractJsonObject(raw);
  const ids = Array.isArray(parsed?.ids) ? parsed.ids.map((id: any) => String(id || '').trim()).filter(Boolean) : [];
  return ids.length ? ids.slice(0, 8) : null;
}

async function extractResumeContext(file: File | null) {
  if (!file) return { text: '', metadata: null as Record<string, any> | null };

  const metadata = {
    name: String(file.name || ''),
    size: Number(file.size || 0),
    type: String(file.type || ''),
  };

  const lowerName = metadata.name.toLowerCase();
  const isTextLike =
    metadata.type.startsWith('text/') ||
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.csv');

  if (!isTextLike) {
    return { text: '', metadata };
  }

  if (metadata.size > 1_500_000) {
    return { text: '', metadata: { ...metadata, skipped: 'file_too_large_for_text_extract' } };
  }

  const text = await file.text().catch(() => '');
  return { text: text.slice(0, 12000), metadata };
}

async function parsePayload(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const resumeUpload = form.get('resumeUpload');
    return {
      linkedinUrl: String(form.get('linkedinUrl') || ''),
      resumeUrl: String(form.get('resumeUrl') || ''),
      processingConsent: String(form.get('processingConsent') || '').toLowerCase() === 'true',
      newsletterConsent: String(form.get('newsletterConsent') || '').toLowerCase() === 'true',
      sourcePage: String(form.get('sourcePage') || ''),
      resumeUpload: resumeUpload instanceof File ? resumeUpload : null,
    };
  }

  const json = await request.json().catch(() => ({}));
  return {
    linkedinUrl: String(json?.linkedinUrl || ''),
    resumeUrl: String(json?.resumeUrl || ''),
    processingConsent: Boolean(json?.processingConsent),
    newsletterConsent: Boolean(json?.newsletterConsent),
    sourcePage: String(json?.sourcePage || ''),
    resumeUpload: null as File | null,
  };
}

export async function POST(request: Request) {
  try {
    const payload = await parsePayload(request);
    const parsed = bodySchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const admin = getSupabaseAdmin() as any;
    const { text: resumeText, metadata: resumeUploadMetadata } = await extractResumeContext(payload.resumeUpload);

    const profileText = [
      `LinkedIn URL: ${parsed.data.linkedinUrl}`,
      parsed.data.resumeUrl ? `Resume URL: ${parsed.data.resumeUrl}` : '',
      resumeText ? `Resume Text: ${resumeText}` : '',
      resumeUploadMetadata?.name ? `Resume File Name: ${resumeUploadMetadata.name}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const { data: activeOpportunities, error: opportunitiesError } = await admin
      .from('opportunities')
      .select('id,slug,title,summary,category,country_or_region,deadline,source_url,tags,eligibility,funding_or_benefits,date_added')
      .gte('deadline', new Date().toISOString().slice(0, 10))
      .order('deadline', { ascending: true })
      .limit(200);

    if (opportunitiesError) {
      return NextResponse.json({ error: opportunitiesError.message }, { status: 500 });
    }

    const pool = Array.isArray(activeOpportunities) ? activeOpportunities : [];
    const aiIds = await rankByAi(profileText, pool);

    const ranked = aiIds?.length
      ? pool
          .filter((row: any) => aiIds.includes(String(row.id)))
          .sort((a: any, b: any) => aiIds.indexOf(String(a.id)) - aiIds.indexOf(String(b.id)))
          .slice(0, 8)
          .map((row: any, index: number) => ({
            id: String(row.id || ''),
            slug: String(row.slug || ''),
            title: String(row.title || ''),
            summary: row.summary ? String(row.summary) : null,
            category: row.category ? String(row.category) : null,
            country_or_region: row.country_or_region ? String(row.country_or_region) : null,
            deadline: row.deadline ? String(row.deadline) : null,
            source_url: row.source_url ? String(row.source_url) : null,
            score: Math.max(1, 100 - index * 6),
          }))
      : rankByFallback(profileText, pool);

    const userAgent = request.headers.get('user-agent') || null;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

    const { error } = await admin.from('ai_match_leads').insert({
      linkedin_url: parsed.data.linkedinUrl,
      resume_url: parsed.data.resumeUrl || null,
      processing_consent: true,
      newsletter_consent: parsed.data.newsletterConsent,
      source_page: parsed.data.sourcePage || 'unknown',
      profile_data: {
        resume_upload: resumeUploadMetadata,
        resume_text_preview: resumeText ? resumeText.slice(0, 800) : null,
        match_ids: ranked.map((item) => item.id),
        match_count: ranked.length,
        used_ai_ranking: Boolean(aiIds?.length),
      },
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      matches: ranked.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        category: item.category,
        country_or_region: item.country_or_region,
        deadline: item.deadline,
        source_url: item.source_url,
      })),
      fromPoolCount: pool.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
