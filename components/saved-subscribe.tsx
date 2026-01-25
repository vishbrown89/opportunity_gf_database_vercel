'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Copy, Mail, Bell } from 'lucide-react';

const SAVED_KEY = 'gf_saved_opportunity_slugs';
const SUBSCRIBED_KEY = 'gf_saved_subscribed';
const EMAIL_KEY = 'gf_saved_email';
const MY_REF_KEY = 'gf_my_ref_code';
const REF_FROM_KEY = 'gf_ref_from';

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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

function randomCode(len: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const buf = new Uint8Array(len);
  const out: string[] = [];

  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(buf);
    for (let i = 0; i < len; i++) out.push(chars[buf[i] % chars.length]);
    return out.join('');
  }

  for (let i = 0; i < len; i++) out.push(chars[Math.floor(Math.random() * chars.length)]);
  return out.join('');
}

function getOrCreateMyRef() {
  try {
    const existing = window.localStorage.getItem(MY_REF_KEY);
    if (existing) return existing;
    const code = randomCode(8);
    window.localStorage.setItem(MY_REF_KEY, code);
    return code;
  } catch {
    return '';
  }
}

function captureRefParamOnce() {
  try {
    const url = new URL(window.location.href);
    const ref = (url.searchParams.get('ref') || '').trim().toLowerCase();
    if (!ref) return;

    const my = getOrCreateMyRef();
    if (my && ref === my) {
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());
      return;
    }

    if (!window.localStorage.getItem(REF_FROM_KEY)) {
      window.localStorage.setItem(REF_FROM_KEY, ref);
    }

    url.searchParams.delete('ref');
    window.history.replaceState({}, '', url.toString());
  } catch {
    return;
  }
}

export default function SavedSubscribe() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [reason, setReason] = useState<'threshold' | 'reminder'>('threshold');

  useEffect(() => {
    captureRefParamOnce();

    try {
      const savedEmail = window.localStorage.getItem(EMAIL_KEY) || '';
      if (savedEmail) setEmail(savedEmail);
    } catch {
      return;
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { reason?: string } | undefined;
      const r = detail?.reason === 'reminder' ? 'reminder' : 'threshold';
      setReason(r);
      setDone(false);
      setOpen(true);
    };

    window.addEventListener('gf_open_saved_subscribe', handler as EventListener);
    return () => window.removeEventListener('gf_open_saved_subscribe', handler as EventListener);
  }, []);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const my = getOrCreateMyRef();
    return my ? `${window.location.origin}/?ref=${my}` : '';
  }, [done]);

  async function subscribe() {
    const cleaned = email.trim().toLowerCase();

    if (!isValidEmail(cleaned)) {
      window.alert('Please enter a valid email address.');
      return;
    }

    const saved = readSaved();
    if (saved.length === 0) {
      window.alert('Please save at least one opportunity first.');
      return;
    }

    setBusy(true);

    let refFrom: string | null = null;
    try {
      refFrom = window.localStorage.getItem(REF_FROM_KEY) || null;
    } catch {
      refFrom = null;
    }

    const { error } = await supabase.from('saved_subscriptions').insert({
      email: cleaned,
      saved_slugs: saved,
      ref_from: refFrom,
    });

    setBusy(false);

    if (error) {
      window.alert(`Subscription failed: ${error.message}`);
      return;
    }

    try {
      window.localStorage.setItem(SUBSCRIBED_KEY, '1');
      window.localStorage.setItem(EMAIL_KEY, cleaned);
    } catch {
      return;
    }

    setDone(true);
  }

  async function copyShare() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      window.alert('Link copied. Share with 2 friends to unlock early access.');
    } catch {
      window.alert(shareUrl);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        {!done ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {reason === 'reminder'
                  ? 'Get a reminder for saved opportunities'
                  : 'Email me my saved opportunities weekly'}
              </DialogTitle>
              <DialogDescription>
                No account needed. We will send you a weekly email with the items you saved.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11"
                inputMode="email"
                autoComplete="email"
              />

              <Button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={busy}
                onClick={subscribe}
              >
                <Mail className="mr-2 h-4 w-4" />
                {busy ? 'Saving...' : 'Subscribe'}
              </Button>

              <div className="text-xs text-slate-500">
                Prefer fewer emails? You can unsubscribe anytime.
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>You are subscribed</DialogTitle>
              <DialogDescription>
                Invite 2 friends to get early access to curated shortlists.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                Your share link:
                <div className="mt-2 break-all font-medium text-slate-900">{shareUrl}</div>
              </div>

              <Button type="button" variant="outline" className="w-full h-11" onClick={copyShare}>
                <Copy className="mr-2 h-4 w-4" />
                Copy share link
              </Button>

              <Button type="button" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function GetReminderButton({ slug }: { slug: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-xl border-slate-300 bg-white"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        const current = readSaved();
        const next = current.includes(slug) ? current : [slug, ...current];
        writeSaved(next);

        window.dispatchEvent(new CustomEvent('gf_open_saved_subscribe', { detail: { reason: 'reminder' } }));
      }}
    >
      <Bell className="mr-2 h-4 w-4" />
      Get reminder
    </Button>
  );
}
