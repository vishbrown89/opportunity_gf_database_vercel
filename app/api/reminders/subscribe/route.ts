import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendMailgunMessage } from '@/lib/reminders/mailgun';
import { buildSubscriptionConfirmationEmail } from '@/lib/reminders/templates';
import { createReminderToken } from '@/lib/reminders/token';
import { getAppUrlFromRequest } from '@/lib/runtime-url';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  email: z.string().trim().email(),
  slug: z.string().trim().optional(),
  savedSlugs: z.array(z.string().trim().min(1)).max(200).optional(),
  refFrom: z.string().trim().max(120).optional().nullable(),
  replaceSaved: z.boolean().optional(),
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
      .filter(Boolean)
      .slice(0, 200);

    const { data: existingRows, error: existingError } = await admin
      .from('saved_subscriptions')
      .select('id, email, saved_slugs')
      .eq('email', email)
      .limit(1);

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    const existing = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null;

    const mergedSlugs = parsed.data.replaceSaved
      ? Array.from(new Set(incoming)).slice(0, 200)
      : Array.from(new Set([...normalizeSlugs(existing?.saved_slugs), ...incoming])).slice(0, 200);

    if (mergedSlugs.length === 0) {
      return NextResponse.json({ error: 'No opportunities selected for reminder tracking.' }, { status: 400 });
    }

    if (existing?.id) {
      const { error: updateError } = await admin
        .from('saved_subscriptions')
        .update({
          email,
          saved_slugs: mergedSlugs,
          ref_from: parsed.data.refFrom || null,
          is_active: true,
          unsubscribed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      const { error: insertError } = await admin.from('saved_subscriptions').insert({
        email,
        saved_slugs: mergedSlugs,
        ref_from: parsed.data.refFrom || null,
        is_active: true,
        unsubscribed_at: null,
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    const { data: opps } = await admin
      .from('opportunities')
      .select('title, slug, deadline, source_url')
      .in('slug', mergedSlugs)
      .order('deadline', { ascending: true })
      .limit(12);

    const today = new Date().toISOString().slice(0, 10);
    const { data: keyCandidates } = await admin
      .from('opportunities')
      .select('title, slug, deadline, featured')
      .gte('deadline', today)
      .order('featured', { ascending: false })
      .order('deadline', { ascending: true })
      .limit(30);

    const mergedSet = new Set(mergedSlugs);
    const suggestedRows = (keyCandidates || [])
      .map((opp: any) => ({
        title: String(opp?.title || 'Opportunity'),
        slug: String(opp?.slug || ''),
        deadline: String(opp?.deadline || ''),
      }))
      .filter((opp: any) => opp.slug && !mergedSet.has(opp.slug))
      .slice(0, 3);

    const unsubscribeToken = createReminderToken(email);
    const appUrl = getAppUrlFromRequest(request);
    const unsubscribeUrl = unsubscribeToken
      ? `${appUrl}/api/reminders/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
      : '';

    const emailRows = (opps || []).map((opp: any) => {
      const title = String(opp?.title || 'Opportunity');
      const slug = String(opp?.slug || '');
      const deadline = String(opp?.deadline || '');
      const href = slug ? `${appUrl}/opportunity/${slug}` : String(opp?.source_url || appUrl);
      return { title, deadline, href };
    });

    const suggested = suggestedRows.map((opp: any) => ({
      title: opp.title,
      deadline: opp.deadline,
      href: `${appUrl}/opportunity/${opp.slug}`,
    }));

    const message = buildSubscriptionConfirmationEmail({
      unsubscribeUrl,
      opportunities: emailRows,
      suggestedOpportunities: suggested,
      newsletterUrl: 'https://growthforum.my/newsletter/'
    });

    try {
      const provider = await sendMailgunMessage({
        to: email,
        subject: message.subject,
        text: message.text,
        html: message.html,
        tags: ['opportunity-reminders', 'subscription-confirmation'],
      });

      return NextResponse.json({ ok: true, mailSent: true, provider, trackedCount: mergedSlugs.length });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error('Mailgun confirmation failed', err);

      return NextResponse.json(
        {
          ok: false,
          error: `Confirmation email failed to send. ${detail}`,
          hint: 'Check MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_REGION (us/eu), and sender domain verification.'
        },
        { status: 502 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
