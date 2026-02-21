export function getAppUrlFromRequest(request: Request) {
  const configured = String(process.env.NEXT_PUBLIC_APP_URL || '').trim();
  if (configured) return configured.replace(/\/$/, '');

  const forwardedHost = request.headers.get('x-forwarded-host') || '';
  const host = forwardedHost || request.headers.get('host') || '';
  const forwardedProto = request.headers.get('x-forwarded-proto') || '';
  const proto = forwardedProto || (host.includes('localhost') ? 'http' : 'https');

  if (host) return `${proto}://${host}`.replace(/\/$/, '');
  return 'https://opportunities.growthforum.my';
}
