'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import ShareButtons from '@/components/share-buttons';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bookmark, BookmarkCheck, ExternalLink, Share2 } from 'lucide-react';

const SAVED_KEY = 'gf_saved_opportunity_slugs';
const SUBSCRIBED_KEY = 'gf_saved_subscribed';

function readSaved(): string[] {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeSaved(slugs: string[]) {
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(slugs));
  } catch {
    return;
  }
}

function normalizeUrl(raw: string) {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  return trimmed;
}

type Props = {
  slug: string;
  title: string;
  sourceUrl: string;
  isActive: boolean;
};

export default function MobileOpportunityActions({ slug, title, sourceUrl, isActive }: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSaved().includes(slug));

    const onUpdate = () => setSaved(readSaved().includes(slug));
    window.addEventListener('gf_saved_updated', onUpdate as EventListener);

    return () => window.removeEventListener('gf_saved_updated', onUpdate as EventListener);
  }, [slug]);

  const safeSourceUrl = useMemo(() => normalizeUrl(sourceUrl), [sourceUrl]);

  const toggleSaved = () => {
    const current = readSaved();
    const exists = current.includes(slug);
    const next = exists ? current.filter((s) => s !== slug) : [slug, ...current];
    writeSaved(next);

    try {
      const alreadySubscribed = window.localStorage.getItem(SUBSCRIBED_KEY) === '1';
      if (!alreadySubscribed && !exists && next.length >= 3) {
        window.dispatchEvent(
          new CustomEvent('gf_open_saved_subscribe', { detail: { reason: 'threshold' } })
        );
      }
    } catch {
      return;
    }

    window.dispatchEvent(new CustomEvent('gf_saved_updated', { detail: { slugs: next } }));
    setSaved(!exists);
  };

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-50">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent" />

      <div className="relative pointer-events-auto mx-auto max-w-5xl px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
        <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-lg px-3 py-3">
          <div className="flex items-center gap-2">
            <Button
              asChild
              className="h-11 flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              disabled={!safeSourceUrl}
            >
              <a href={safeSourceUrl || '#'} target="_blank" rel="noreferrer">
                {isActive ? 'Apply' : 'Open source'}
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-11 rounded-xl border-slate-200 bg-white"
              aria-label={saved ? 'Saved' : 'Save'}
              onClick={toggleSaved}
            >
              {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-11 rounded-xl border-slate-200 bg-white"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="bottom"
                className="rounded-t-2xl border-slate-200 px-0 pb-8 pt-5"
              >
                <div className="px-5">
                  <SheetHeader className="text-left">
                    <SheetTitle className="text-base font-semibold text-slate-900">
                      Share this opportunity
                    </SheetTitle>
                  </SheetHeader>
                </div>

                <div className="px-5 pt-4">
                  <ShareButtons title={String(title || 'Opportunity')} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
