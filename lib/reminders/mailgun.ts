const MAILGUN_BASE_URL = 'https://api.mailgun.net/v3';

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export type MailgunMessageInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  tags?: string[];
};

export async function sendMailgunMessage(input: MailgunMessageInput) {
  const apiKey = requireEnv('MAILGUN_API_KEY');
  const domain = requireEnv('MAILGUN_DOMAIN');
  const fromName = process.env.MAILGUN_FROM_NAME?.trim() || 'Growth Forum';
  const fromEmail = process.env.MAILGUN_FROM_EMAIL?.trim() || `noreply@${domain}`;

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

  const response = await fetch(`${MAILGUN_BASE_URL}/${domain}/messages`, {
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
    throw new Error(`Mailgun send failed (${response.status}): ${details}`);
  }

  return response.json();
}
