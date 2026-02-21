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
  profileData: z.record(z.any()).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const admin = getSupabaseAdmin() as any;

    const userAgent = request.headers.get('user-agent') || null;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

    const { error } = await admin.from('ai_match_leads').insert({
      linkedin_url: parsed.data.linkedinUrl,
      resume_url: parsed.data.resumeUrl || null,
      processing_consent: true,
      newsletter_consent: parsed.data.newsletterConsent,
      source_page: parsed.data.sourcePage || 'unknown',
      profile_data: parsed.data.profileData || {},
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
