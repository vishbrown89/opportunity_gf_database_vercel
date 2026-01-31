'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Link2 } from 'lucide-react';

type Props = {
  title: string;
};

function buildWhatsAppUrl(title: string, url: string) {
  const text = `${title}\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function buildLinkedInLinks(url: string) {
  const primary = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const fallback = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`;
  return { primary, fallback };
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M19.11 17.47c-.27-.14-1.6-.79-1.84-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.2-1.34-.82-.73-1.38-1.63-1.54-1.9-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.83-2.01-.22-.53-.44-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29 0 1.35.99 2.66 1.13 2.84.14.18 1.94 2.96 4.7 4.15.66.28 1.17.45 1.57.58.66.21 1.26.18 1.73.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"
      />
      <path
        fill="currentColor"
        d="M16.02 3.2c-7.07 0-12.82 5.75-12.82 12.82 0 2.24.58 4.43 1.69 6.36L3.2 28.8l6.6-1.73a12.77 12.77 0 0 0 6.22 1.61h.01c7.07 0 12.82-5.75 12.82-12.82S23.09 3.2 16.02 3.2zm0 22.99h-.01c-2.01 0-3.98-.54-5.7-1.57l-.41-.24-3.92 1.03 1.05-3.82-.27-.39a10.69 10.69 0 0 1-1.73-5.81c0-5.9 4.8-10.7 10.7-10.7 5.9 0 10.7 4.8 10.7 10.7 0 5.9-4.8 10.8-10.71 10.8z"
      />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0.5 23.5h4V7.98h-4V23.5zM8 7.98h3.83v2.12h.05c.53-1 1.83-2.12 3.77-2.12 4.03 0 4.78 2.65 4.78 6.09v9.43h-4v-8.36c0-1.99-.04-4.55-2.77-4.55-2.77 0-3.19 2.16-3.19 4.4v8.51H8V7.98z"
      />
    </svg>
  );
}

export default function ShareButtons({ title }: Props) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      setUrl(window.location.href);
    } catch {
      setUrl('');
    }
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  const disabled = !url;

  const whatsappHref = useMemo(() => {
    if (!url) return '';
    return buildWhatsAppUrl(title, url);
  }, [title, url]);

  const linkedinLinks = useMemo(() => {
    if (!url) return { primary: '', fallback: '' };
    return buildLinkedInLinks(url);
  }, [url]);

  const copyLink = async () => {
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      return;
    } catch {}

    try {
      const el = document.createElement('textarea');
      el.value = url;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const openLinkedInComposer = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!linkedinLinks.primary) return;

    e.preventDefault();

    try {
      const w = window.open(linkedinLinks.primary, '_blank', 'noopener,noreferrer');
      if (!w) {
        window.open(linkedinLinks.fallback, '_blank', 'noopener,noreferrer');
        return;
      }

      setTimeout(() => {
        try {
          w.location.href = linkedinLinks.fallback;
        } catch {}
      }, 900);
    } catch {
      window.open(linkedinLinks.fallback, '_blank', 'noopener,noreferrer');
    }
  };

  const baseBtn =
    'h-11 w-full rounded-xl justify-start px-4 text-sm font-semibold shadow-sm transition-colors';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
          Share
        </div>
        <div className="mt-1 text-sm text-slate-700 leading-snug">
          Send this opportunity to your network.
        </div>
      </div>

      <div className="px-5 py-5 space-y-3">
        <Button
          asChild
          className={`${baseBtn} bg-[#25D366] text-white hover:bg-[#1FB85A]`}
          disabled={disabled}
        >
          <a
            href={whatsappHref || '#'}
            target="_blank"
            rel="noreferrer"
            aria-disabled={disabled}
            className="flex items-center gap-3 w-full"
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/15">
              <WhatsAppIcon className="w-4 h-4 text-white" />
            </span>
            <span className="flex-1 min-w-0">Share on WhatsApp</span>
          </a>
        </Button>

        <Button
          asChild
          className={`${baseBtn} bg-[#0A66C2] text-white hover:bg-[#085AA9]`}
          disabled={disabled}
        >
          <a
            href={linkedinLinks.primary || '#'}
            target="_blank"
            rel="noreferrer"
            aria-disabled={disabled}
            onClick={openLinkedInComposer}
            className="flex items-center gap-3 w-full"
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/15">
              <LinkedInIcon className="w-4 h-4 text-white" />
            </span>
            <span className="flex-1 min-w-0">Share on LinkedIn</span>
          </a>
        </Button>

        <Button
          type="button"
          onClick={copyLink}
          className={`${baseBtn} bg-slate-900/5 text-slate-900 border border-slate-200 hover:bg-slate-900/10 hover:border-slate-300`}
          disabled={disabled}
        >
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-900/5">
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
          </span>
          <span className="ml-3 flex-1 min-w-0">
            {copied ? 'Link copied' : 'Copy link'}
          </span>
        </Button>
      </div>
    </div>
  );
}
