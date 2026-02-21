function getConfiguredRegion() {
  return (process.env.MAILGUN_REGION || 'us').trim().toLowerCase() === 'eu' ? 'eu' : 'us';
}

function baseUrlFor(region: 'us' | 'eu') {
  return region === 'eu' ? 'https://api.eu.mailgun.net/v3' : 'https://api.mailgun.net/v3';
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function normalizeFromEmail(domain: string) {
  const provided = process.env.MAILGUN_FROM_EMAIL?.trim();
  if (!provided) return `noreply@${domain}`;

  const lowerDomain = domain.toLowerCase();
  const at = provided.lastIndexOf('@');
  if (at === -1) return `noreply@${domain}`;

  const senderDomain = provided.slice(at + 1).toLowerCase();
  if (senderDomain !== lowerDomain) {
    return `noreply@${domain}`;
  }

  return provided;
}

export type MailgunMessageInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  tags?: string[];
};

type AttemptResult = {
  ok: boolean;
  status: number;
  details: string;
  data?: any;
};

async function attemptSend(region: 'us' | 'eu', domain: string, apiKey: string, body: URLSearchParams): Promise<AttemptResult> {
  const response = await fetch(`${baseUrlFor(region)}/${domain}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const details = await response.text();
    return {
      ok: false,
      status: response.status,
      details,
    };
  }

  return {
    ok: true,
    status: response.status,
    details: '',
    data: await response.json(),
  };
}

export async function sendMailgunMessage(input: MailgunMessageInput) {
  const apiKey = requireEnv('MAILGUN_API_KEY');
  const domain = requireEnv('MAILGUN_DOMAIN');
  const fromName = process.env.MAILGUN_FROM_NAME?.trim() || 'Growth Forum';
  const fromEmail = normalizeFromEmail(domain);

  const body = new URLSearchParams();
  body.set('from', `${fromName} <${fromEmail}>`);
  body.set('to', input.to);
  body.set('subject', input.subject);
  body.set('text', input.text);

  if (input.html) {
    body.set('html', input.html);
  }

  for (const tag of input.tags || []) {
    if (tag.trim()) body.append('o:tag', tag.trim());
  }

  const configured = getConfiguredRegion();
  const fallback: 'us' | 'eu' = configured === 'us' ? 'eu' : 'us';

  const first = await attemptSend(configured, domain, apiKey, body);
  if (first.ok) return first.data;

  if (first.status === 401 || first.status === 403 || first.status === 404) {
    const second = await attemptSend(fallback, domain, apiKey, body);
    if (second.ok) return second.data;

    throw new Error(
      `Mailgun send failed in both regions. ` +
        `[${configured.toUpperCase()} ${first.status}] ${first.details} | ` +
        `[${fallback.toUpperCase()} ${second.status}] ${second.details}`
    );
  }

  throw new Error(`Mailgun send failed (${first.status}): ${first.details}`);
}
