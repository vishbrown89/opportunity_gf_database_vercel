import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendMailgunMessage } from '@/lib/reminders/mailgun';
import { createReminderToken } from '@/lib/reminders/token';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  email: z.string().trim().email(),
  slug: z.string().trim().optional(),
  savedSlugs: z.array(z.string().trim().min(1)).max(200).optional(),
  refFrom: z.string().trim().max(120).optional().nullable(),
});

function normalizeSlugs(input: unknown) {
  if (!Array.isArray(input)) return [];
  return input.map((item) => String(item || '').trim()).filter(Boolean);
}

export async function POST(request: Request) {
  const admin = getSupabaseAdmin() as any;

  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const incoming = [...(parsed.data.savedSlugs || []), parsed.data.slug || '']
      .map((s) => s.trim())
      .filter(Boolean);

    const { data: existing, error: existingError } = await admin
      .from('saved_subscriptions')
      .select('saved_slugs')
      .eq('email', email)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    const mergedSlugs = Array.from(new Set([...normalizeSlugs(existing?.saved_slugs), ...incoming])).slice(
      0,
      200
    );

    const { error: saveError } = await admin.from('saved_subscriptions').upsert(
      {
        email,
        saved_slugs: mergedSlugs,
        ref_from: parsed.data.refFrom || null,
        is_active: true,
        unsubscribed_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    const { data: opps } = await admin
      .from('opportunities')
      .select('title, slug, deadline, source_url')
      .in('slug', mergedSlugs)
      .order('deadline', { ascending: true })
      .limit(12);

    const unsubscribeToken = createReminderToken(email);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';
    const unsubscribeUrl = unsubscribeToken
      ? `${appUrl}/api/reminders/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
      : '';

    const rows = (opps || [])
      .map((opp: any) => {
        const title = String(opp?.title || 'Opportunity');
        const slug = String(opp?.slug || '');
        const deadline = String(opp?.deadline || '');
        const href = slug ? `${appUrl}/opportunity/${slug}` : String(opp?.source_url || appUrl);
        return `- ${title} (Deadline: ${deadline || 'TBC'})\\n  ${href}`;
      })
      .join('\\n');

    const text = [
      'You are now subscribed to opportunity deadline reminders.',
      '',
      'We will send you alerts when your saved opportunities are close to expiry.',
      '',
      rows ? `Currently tracked opportunities:\\n${rows}` : 'No saved opportunities were found yet.',
      '',
      unsubscribeUrl ? `Unsubscribe: ${unsubscribeUrl}` : '',
    ]
      .filter(Boolean)
      .join('\\n');

    let mailSent = false;

    try {
      await sendMailgunMessage({
        to: email,
        subject: 'You are subscribed to opportunity reminders',
        text,
        html: text.replace(/\\n/g, '<br />'),
        tags: ['opportunity-reminders', 'subscription-confirmation'],
      });
      mailSent = true;
    } catch (mailError) {
      console.error('Mailgun confirmation failed', mailError);
    }

    return NextResponse.json({ ok: true, mailSent });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
