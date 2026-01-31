'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import OpportunityCard from '@/components/opportunity-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase, Opportunity } from '@/lib/supabase';
import { getOpportunityStatus } from '@/lib/opportunity-utils';
import { Bookmark, RefreshCw, Trash2, ExternalLink } from 'lucide-react';

const SAVED_KEY = 'gf_saved_opportunity_slugs';

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

type SortMode = 'recent' | 'deadline_soonest' | 'deadline_latest';
type StatusMode = 'All' | 'Active' | 'Expired';

export default function SavedPage() {
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [statusMode, setStatusMode] = useState<StatusMode>('All');

  const load = async () => {
    setLoading(true);
    setErrorText(null);

    const slugs = readSaved();
    setSavedSlugs(slugs);

    if (slugs.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .in('slug', slugs);

    if (error) {
      setItems([]);
      setErrorText(error.message);
      setLoading(false);
      return;
    }

    const list = (data || []) as Opportunity[];

    const bySlug = new Map<string, Opportunity>();
    for (const opp of list) bySlug.set(String(opp.slug), opp);

    const ordered = slugs.map((s) => bySlug.get(s)).filter(Boolean) as Opportunity[];
    setItems(ordered);
    setLoading(false);
  };

  useEffect(() => {
    load();

    const onUpdate = () => load();
    window.addEventListener('gf_saved_updated', onUpdate as EventListener);

    return () => window.removeEventListener('gf_saved_updated', onUpdate as EventListener);
  }, []);

  const visible = useMemo(() => {
    let out = [...items];

    if (statusMode !== 'All') {
      out = out.filter((opp) => getOpportunityStatus(opp.deadline) === statusMode);
    }

    if (sortMode === 'deadline_soonest') {
      out.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (sortMode === 'deadline_latest') {
      out.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
    } else {
      const pos = new Map<string, number>();
      for (let i = 0; i < savedSlugs.length; i++) pos.set(savedSlugs[i], i);
      out.sort((a, b) => (pos.get(a.slug) ?? 999999) - (pos.get(b.slug) ?? 999999));
    }

    return out;
  }, [items, savedSlugs, sortMode, statusMode]);

  const clearAll = () => {
    writeSaved([]);
    window.dispatchEvent(new CustomEvent('gf_saved_updated', { detail: { slugs: [] } }));
    setSavedSlugs([]);
    setItems([]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="pt-20">
        <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-16 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Saved Opportunities</h1>
                <p className="text-lg md:text-xl text-slate-600 max-w-3xl">
                  Your saved list is stored on this device. Use this page to return, compare deadlines, and apply when ready.
                </p>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <Button type="button" variant="outline" className="h-11" onClick={load} disabled={loading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-red-200 text-red-700 hover:text-red-800"
                  onClick={clearAll}
                  disabled={savedSlugs.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
                <div className="text-sm font-semibold text-slate-700 mb-2">Sort</div>
                <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
                  <SelectTrigger className="h-11 border-2 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Saved</SelectItem>
                    <SelectItem value="deadline_soonest">Soonest Deadline</SelectItem>
                    <SelectItem value="deadline_latest">Latest Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
                <div className="text-sm font-semibold text-slate-700 mb-2">Status</div>
                <Select value={statusMode} onValueChange={(v) => setStatusMode(v as StatusMode)}>
                  <SelectTrigger className="h-11 border-2 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expired">Previous</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white border-2 border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <Bookmark className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-semibold">Saved</div>
                    <div className="text-xl font-bold text-slate-900">{savedSlugs.length}</div>
                  </div>
                </div>

                <div className="md:hidden flex items-center gap-2">
                  <Button type="button" variant="outline" className="h-11" onClick={load} disabled={loading}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 border-red-200 text-red-700 hover:text-red-800"
                    onClick={clearAll}
                    disabled={savedSlugs.length === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {errorText ? (
            <div className="bg-white border-2 border-red-200 rounded-xl p-8">
              <div className="text-red-700 font-semibold mb-2">Could not load saved opportunities</div>
              <div className="text-slate-700">{errorText}</div>
              <div className="mt-4">
                <Button type="button" onClick={load} className="bg-blue-600 hover:bg-blue-700">
                  Try again
                </Button>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
              <p className="text-slate-600 font-medium">Loading saved opportunities...</p>
            </div>
          ) : savedSlugs.length === 0 ? (
            <div className="bg-white border-2 border-slate-200 rounded-xl p-12 text-center">
              <div className="max-w-md mx-auto">
                <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No saved opportunities yet</h3>
                <p className="text-slate-600 mb-6">
                  Browse opportunities and tap the bookmark icon to save them here.
                </p>
                <Link href="/opportunities">
                  <Button type="button" className="bg-blue-600 hover:bg-blue-700">
                    Browse opportunities
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : visible.length === 0 ? (
            <div className="bg-white border-2 border-slate-200 rounded-xl p-12 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Nothing matches your filters</h3>
              <p className="text-slate-600">Try changing Sort or Status.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
