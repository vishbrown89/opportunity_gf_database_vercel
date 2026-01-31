'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link2, Linkedin, MessageCircle } from 'lucide-react';

type Props = {
  title: string;
};

export default function ShareButtons({ title }: Props) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    try {
      setUrl(window.location.href);
    } catch {
      setUrl('');
    }
  }, []);

  const waHref = useMemo(() => {
    if (!url) return '';
    const text = `${title}\n${url}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [title, url]);

  const liHref = useMemo(() => {
    if (!url) return '';
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  }, [url]);

  const buttonClass =
    'inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors w-full';

  const disabledClass = 'opacity-50 pointer-events-none';

  const copyLink = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      window.alert('Link copied');
    } catch {
      window.alert(url);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
      <div className="text-sm font-semibold text-slate-900 mb-3">Share</div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href={waHref || '#'}
          target="_blank"
          rel="noreferrer"
          className={`${buttonClass} ${waHref ? '' : disabledClass}`}
          aria-disabled={!waHref}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>

        <a
          href={liHref || '#'}
          target="_blank"
          rel="noreferrer"
          className={`${buttonClass} ${liHref ? '' : disabledClass}`}
          aria-disabled={!liHref}
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </a>

        <button
          type="button"
          onClick={copyLink}
          className={`${buttonClass} ${url ? '' : disabledClass}`}
          disabled={!url}
        >
          <Link2 className="w-4 h-4" />
          Copy link
        </button>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        Share the official listing link with your network.
      </div>
    </div>
  );
}
