import crypto from 'crypto';

type Payload = {
  email: string;
  exp: number;
};

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.CRON_SECRET || '';
}

function encode(payload: Payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decodeToken(encoded: string): Payload | null {
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Payload;
  } catch {
    return null;
  }
}

function sign(encoded: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
}

export function createAdminSessionToken(email: string, ttlSeconds = 60 * 60 * 24 * 7) {
  const secret = getSecret();
  if (!secret) throw new Error('Missing ADMIN_SESSION_SECRET');

  const payload: Payload = {
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const encoded = encode(payload);
  const sig = sign(encoded, secret);
  return `${encoded}.${sig}`;
}

export function verifyAdminSessionToken(token: string) {
  const secret = getSecret();
  if (!secret || !token) return null;

  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;

  const expected = sign(encoded, secret);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  const payload = decodeToken(encoded);
  if (!payload?.email || !payload?.exp) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload.email;
}
