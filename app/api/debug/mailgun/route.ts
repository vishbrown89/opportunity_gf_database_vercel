import { NextResponse } from 'next/server';

function mask(value: string) {
  if (!value) return '';
  if (value.length <= 8) return '*'.repeat(value.length);
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function authHeader(apiKey: string) {
  return `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`;
}

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET || '';
  if (!secret) return false;
  return (req.headers.get('authorization') || '') === `Bearer ${secret}`;
}

async function checkDomain(region: 'us' | 'eu', apiKey: string, domain: string) {
  const base = region === 'eu' ? 'https://api.eu.mailgun.net/v3' : 'https://api.mailgun.net/v3';
  const res = await fetch(`${base}/domains/${encodeURIComponent(domain)}`, {
    headers: { Authorization: authHeader(apiKey) },
    cache: 'no-store'
  });
  const text = await res.text().catch(() => '');
  return {
    region,
    status: res.status,
    ok: res.ok,
    body: text.slice(0, 800)
  };
}

async function sendTest(region: 'us' | 'eu', apiKey: string, domain: string, to: string, fromEmail: string) {
  const base = region === 'eu' ? 'https://api.eu.mailgun.net/v3' : 'https://api.mailgun.net/v3';
  const body = new URLSearchParams();
  body.set('from', `Growth Forum <${fromEmail}>`);
  body.set('to', to);
  body.set('subject', 'Mailgun Debug Test');
  body.set('text', 'Mailgun debug test from Opportunities Growth Forum.');

  const res = await fetch(`${base}/${domain}/messages`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(apiKey),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString(),
    cache: 'no-store'
  });

  const text = await res.text().catch(() => '');
  return {
    region,
    status: res.status,
    ok: res.ok,
    body: text.slice(0, 800)
  };
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const to = String(url.searchParams.get('to') || '').trim();

  const apiKey = String(process.env.MAILGUN_API_KEY || '').trim();
  const domain = String(process.env.MAILGUN_DOMAIN || '').trim();
  const region = String(process.env.MAILGUN_REGION || 'us').trim().toLowerCase();
  const fromEmailRaw = String(process.env.MAILGUN_FROM_EMAIL || '').trim();
  const fromEmail = fromEmailRaw || (domain ? `noreply@${domain}` : '');

  const diagnostics: any = {
    env: {
      has_api_key: apiKey.length > 0,
      api_key_masked: mask(apiKey),
      domain,
      region,
      from_email: fromEmail,
      from_matches_domain: fromEmail.includes('@') ? fromEmail.split('@')[1].toLowerCase() === domain.toLowerCase() : false
    }
  };

  if (!apiKey || !domain) {
    return NextResponse.json({ ...diagnostics, error: 'Missing MAILGUN_API_KEY or MAILGUN_DOMAIN' }, { status: 400 });
  }

  const [domainUs, domainEu] = await Promise.all([
    checkDomain('us', apiKey, domain),
    checkDomain('eu', apiKey, domain)
  ]);

  diagnostics.domain_check = { us: domainUs, eu: domainEu };

  if (to) {
    const [sendUs, sendEu] = await Promise.all([
      sendTest('us', apiKey, domain, to, fromEmail),
      sendTest('eu', apiKey, domain, to, fromEmail)
    ]);

    diagnostics.send_test = { to, us: sendUs, eu: sendEu };
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
