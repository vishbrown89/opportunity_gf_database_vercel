'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';

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

export function SaveLocalButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSaved().includes(slug));

    const onUpdate = () => setSaved(readSaved().includes(slug));
    window.addEventListener('gf_saved_updated', onUpdate as EventListener);

    return () => window.removeEventListener('gf_saved_updated', onUpdate as EventListener);
  }, [slug]);

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      className="h-9 w-9 rounded-xl border-slate-300 bg-white/90 hover:bg-white"
      aria-label={saved ? 'Saved' : 'Save'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

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
      }}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
    </Button>
  );
}
