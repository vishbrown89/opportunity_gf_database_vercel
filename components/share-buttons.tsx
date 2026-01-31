'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Link2, Linkedin, MessageCircle } from 'lucide-react';

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
    'h-10 rounded-xl justify-center font-semibold w-full shadow-sm';

  const waBtn =
    'bg-[#25D366] text-white border border-transparent hover:bg-[#1FB85A]';

  const liBtn =
    'bg-[#0A66C2] text-white border border-transparent hover:bg-[#085AA9]';

  const copyBtn =
    'bg-slate-900/5 text-slate-900 border border-slate-200 hover:bg-slate-900/10 hover:border-slate-300';

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

      <div className="px-5 py-5">
        <div className="grid grid-cols-3 gap-3 items-stretch">
          <Button
            asChild
            className={`${baseBtn} ${waBtn}`}
            disabled={disabled}
          >
            <a
              href={whatsappHref || '#'}
              target="_blank"
              rel="noreferrer"
              aria-disabled={disabled}
              className="inline-flex items-center justify-center w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </a>
          </Button>

          <Button
            asChild
            className={`${baseBtn} ${liBtn}`}
            disabled={disabled}
          >
            <a
              href={linkedinLinks.primary || '#'}
              target="_blank"
              rel="noreferrer"
              aria-disabled={disabled}
              onClick={openLinkedInComposer}
              className="inline-flex items-center justify-center w-full"
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </a>
          </Button>

          <Button
            type="button"
            onClick={copyLink}
            className={`${baseBtn} ${copyBtn}`}
            disabled={disabled}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-2" />
                Copy link
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
