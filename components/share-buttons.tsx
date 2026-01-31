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
    const t = setTimeout(() => setCopied(false), 1600);
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Share
        </div>
        <div className="mt-1 text-sm text-slate-700 leading-snug">
          Send this opportunity to your network.
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 justify-start"
            disabled={disabled}
          >
            <a
              href={whatsappHref || '#'}
              target="_blank"
              rel="noreferrer"
              aria-disabled={disabled}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 justify-start"
            disabled={disabled}
          >
            <a
              href={linkedinLinks.primary || '#'}
              target="_blank"
              rel="noreferrer"
              aria-disabled={disabled}
              onClick={openLinkedInComposer}
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </a>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={copyLink}
            className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 justify-start"
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

        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
          <div className="text-xs text-slate-600 leading-relaxed">
            LinkedIn will attach a preview card for your link, then you add your caption.
          </div>
        </div>
      </div>
    </div>
  );
}
