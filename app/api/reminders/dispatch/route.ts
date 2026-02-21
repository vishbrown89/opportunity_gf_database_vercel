import { NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendMailgunMessage } from '@/lib/reminders/mailgun';
import { createReminderToken } from '@/lib/reminders/token';

export const dynamic = 'force-dynamic';

type Subscription = {
  id: number;
  email: string;
  saved_slugs: unknown;
  is_active: boolean;
  last_reminder_sent_on: string | null;
};

type Opportunity = {
  slug: string;
  title: string;
  deadline: string;
  source_url: string | null;
};

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function parseSlugs(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || '').trim()).filter(Boolean);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isAuthorized(request: Request) {
  const secret = process.env.REMINDER_CRON_SECRET || process.env.CRON_SECRET || '';
  if (!secret) return false;

  const auth = request.headers.get('authorization') || '';
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  const admin = getSupabaseAdmin() as any;

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const daysAhead = Number(process.env.REMINDER_DAYS_AHEAD || 3);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';
  const today = startOfDay(new Date());
  const cutoff = new Date(today);
  cutoff.setUTCDate(cutoff.getUTCDate() + Math.max(1, daysAhead));
  const todayStr = formatDate(today);

  const { data: subscriptions, error: subscriptionsError } = await admin
    .from('saved_subscriptions')
    .select('id, email, saved_slugs, is_active, last_reminder_sent_on')
    .eq('is_active', true)
    .limit(1000);

  if (subscriptionsError) {
    return NextResponse.json({ error: subscriptionsError.message }, { status: 500 });
  }

  const activeSubs = (subscriptions || []) as Subscription[];
  const allSlugs = Array.from(new Set(activeSubs.flatMap((sub) => parseSlugs(sub.saved_slugs))));

  if (allSlugs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: activeSubs.length });
  }

  const { data: opportunities, error: oppError } = await admin
    .from('opportunities')
    .select('slug, title, deadline, source_url')
    .in('slug', allSlugs)
    .order('deadline', { ascending: true });

  if (oppError) {
    return NextResponse.json({ error: oppError.message }, { status: 500 });
  }

  const oppBySlug = new Map<string, Opportunity>();
  for (const opp of (opportunities || []) as Opportunity[]) {
    oppBySlug.set(opp.slug, opp);
  }

  let sent = 0;
  let skipped = 0;

  for (const sub of activeSubs) {
    if ((sub.last_reminder_sent_on || '').slice(0, 10) === todayStr) {
      skipped += 1;
      continue;
    }

    const saved = parseSlugs(sub.saved_slugs);
    if (saved.length === 0) {
      skipped += 1;
      continue;
    }

    const expiring = saved
      .map((slug) => oppBySlug.get(slug))
      .filter((opp): opp is Opportunity => Boolean(opp))
      .filter((opp) => {
        const date = startOfDay(new Date(opp.deadline));
        return date >= today && date <= cutoff;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));

    if (expiring.length === 0) {
      skipped += 1;
      continue;
    }

    const token = createReminderToken(sub.email);
    const unsubscribeUrl = token
      ? `${appUrl}/api/reminders/unsubscribe?token=${encodeURIComponent(token)}`
      : '';

    const lines = expiring
      .map((opp) => {
        const link = `${appUrl}/opportunity/${opp.slug}`;
        return `- ${opp.title}\\n  Deadline: ${opp.deadline}\\n  ${link}`;
      })
      .join('\\n');

    const text = [
      `You have ${expiring.length} saved opportunit${expiring.length === 1 ? 'y' : 'ies'} expiring soon.`,
      '',
      lines,
      '',
      unsubscribeUrl ? `Unsubscribe: ${unsubscribeUrl}` : '',
    ]
      .filter(Boolean)
      .join('\\n');

    try {
      await sendMailgunMessage({
        to: sub.email,
        subject: `Reminder: ${expiring.length} opportunity deadline${expiring.length === 1 ? '' : 's'} approaching`,
        text,
        html: text.replace(/\\n/g, '<br />'),
        tags: ['opportunity-reminders', 'deadline-reminder'],
      });

      await admin
        .from('saved_subscriptions')
        .update({ last_reminder_sent_on: todayStr, updated_at: new Date().toISOString() })
        .eq('id', sub.id);

      sent += 1;
    } catch (error) {
      console.error(`Reminder send failed for ${sub.email}`, error);
      skipped += 1;
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, daysAhead });
}
