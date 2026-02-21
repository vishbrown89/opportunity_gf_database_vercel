import crypto from 'crypto';

function getSecret() {
  return process.env.REMINDER_SIGNING_SECRET || process.env.CRON_SECRET || '';
}

export function createReminderToken(email: string) {
  const secret = getSecret();
  if (!secret) return '';

  const normalized = email.trim().toLowerCase();
  const sig = crypto.createHmac('sha256', secret).update(normalized).digest('hex');
  return Buffer.from(`${normalized}.${sig}`).toString('base64url');
}

export function verifyReminderToken(token: string) {
  const secret = getSecret();
  if (!secret) return null;

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [email, sig] = decoded.split('.');
    if (!email || !sig) return null;

    const normalized = email.trim().toLowerCase();
    const expected = crypto.createHmac('sha256', secret).update(normalized).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    return normalized;
  } catch {
    return null;
  }
}
