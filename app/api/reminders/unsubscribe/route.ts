import { verifyReminderToken } from '@/lib/reminders/token';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const okHtml = `<!doctype html>
<html><head><meta charset="utf-8"><title>Unsubscribed</title></head>
<body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
  <div style="max-width:640px;margin:0 auto;background:white;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
    <h1 style="margin:0 0 12px;font-size:24px;color:#0f172a;">You are unsubscribed</h1>
    <p style="margin:0;color:#334155;line-height:1.6;">You will no longer receive deadline reminder emails for saved opportunities.</p>
  </div>
</body></html>`;

const invalidHtml = `<!doctype html>
<html><head><meta charset="utf-8"><title>Invalid Link</title></head>
<body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
  <div style="max-width:640px;margin:0 auto;background:white;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
    <h1 style="margin:0 0 12px;font-size:24px;color:#0f172a;">This link is invalid</h1>
    <p style="margin:0;color:#334155;line-height:1.6;">Please request a new reminder email and try the unsubscribe link again.</p>
  </div>
</body></html>`;

export async function GET(request: Request) {
  const admin = getSupabaseAdmin() as any;
  const url = new URL(request.url);
  const token = (url.searchParams.get('token') || '').trim();
  const email = verifyReminderToken(token);

  if (!email) {
    return new Response(invalidHtml, {
      status: 400,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  await admin
    .from('saved_subscriptions')
    .update({ is_active: false, unsubscribed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('email', email);

  return new Response(okHtml, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
