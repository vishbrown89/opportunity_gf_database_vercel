'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
  title: string;
  logoUrl?: string | null;
  imgClassName?: string;
  fallbackClassName?: string;
};

function normalizeUrl(raw: string) {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  return trimmed;
}

function shouldProxy(url: string) {
  const u = url.trim().toLowerCase();
  return u.startsWith('http://') || u.startsWith('//');
}

export default function OpportunityLogo({
  title,
  logoUrl,
  imgClassName,
  fallbackClassName,
}: Props) {
  const direct = useMemo(() => normalizeUrl(String(logoUrl || '')), [logoUrl]);

  const finalUrl = useMemo(() => {
    if (!direct) return '';
    if (shouldProxy(direct)) return `/api/logo?url=${encodeURIComponent(direct)}`;
    return direct;
  }, [direct]);

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [finalUrl]);

  const show = Boolean(finalUrl) && !failed;

  if (show) {
    return (
      <img
        key={finalUrl}
        src={finalUrl}
        alt={`${title} logo`}
        className={imgClassName || 'max-h-full max-w-full object-contain'}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }

  const letter = String(title || 'O').trim().charAt(0) || 'O';

  return (
    <div
      className={
        fallbackClassName ||
        'w-20 h-20 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-center shadow-sm'
      }
      aria-label="Logo placeholder"
    >
      <span className="text-slate-400 text-2xl font-bold">{letter}</span>
    </div>
  );
}
