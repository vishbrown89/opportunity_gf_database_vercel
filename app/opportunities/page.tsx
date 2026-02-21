'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import OpportunityCard from '@/components/opportunity-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CATEGORIES, Opportunity } from '@/lib/supabase';
import { Search, Filter, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function OpportunitiesPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [items, setItems] = useState<Opportunity[]>([]);
  const [hasNext, setHasNext] = useState(false);

  const [searchTerm, setSearchTerm] = useState(() => sp.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => sp.get('category') || 'All');
  const [selectedCountry, setSelectedCountry] = useState(() => sp.get('country') || 'All');
  const [sortBy, setSortBy] = useState(() => sp.get('sort') || 'deadline');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Expired'>(
    () => (sp.get('status') === 'Expired' ? 'Expired' : 'Active')
  );
  const [page, setPage] = useState(() => {
    const n = Number(sp.get('page') || '1');
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
  });

  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch('/api/opportunities?mode=countries', { cache: 'no-store' });
        const payload = await res.json();
        if (!res.ok) return;
        setCountries(Array.isArray(payload?.countries) ? payload.countries : []);
      } catch {
        return;
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    const q = searchTerm.trim();
    if (q) params.set('q', q);

    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (selectedCountry !== 'All') params.set('country', selectedCountry);

    if (sortBy !== 'deadline') params.set('sort', sortBy);
    if (statusFilter !== 'Active') params.set('status', statusFilter);

    if (page !== 1) params.set('page', String(page));

    const qs = params.toString();
    router.replace(qs ? `/opportunities?${qs}` : '/opportunities', { scroll: false });
  }, [router, searchTerm, selectedCategory, selectedCountry, sortBy, statusFilter, page]);

  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      setErrorText(null);

      const params = new URLSearchParams({
        q: searchTerm.trim(),
        category: selectedCategory,
        country: selectedCountry,
        sort: sortBy,
        status: statusFilter,
        page: String(page),
      });

      try {
        const res = await fetch(`/api/opportunities?${params.toString()}`, {
          cache: 'no-store',
        });

        const payload = await res.json();

        if (!res.ok) {
          setItems([]);
          setHasNext(false);
          setErrorText(payload?.error || 'Could not fetch opportunities');
          setLoading(false);
          return;
        }

        setItems(Array.isArray(payload?.items) ? payload.items : []);
        setHasNext(Boolean(payload?.hasNext));
      } catch (error) {
        setItems([]);
        setHasNext(false);
        setErrorText(error instanceof Error ? error.message : 'Could not fetch opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
  }, [searchTerm, selectedCategory, selectedCountry, sortBy, statusFilter, page]);

  const statusLabel = statusFilter === 'Active' ? 'active' : 'previous';

  const onChangeSearch = (v: string) => {
    setSearchTerm(v);
    setPage(1);
  };

  const onChangeCategory = (v: string) => {
    setSelectedCategory(v);
    setPage(1);
  };

  const onChangeCountry = (v: string) => {
    setSelectedCountry(v);
    setPage(1);
  };

  const onChangeSort = (v: string) => {
    setSortBy(v);
    setPage(1);
  };

  const onChangeStatus = (v: 'Active' | 'Expired') => {
    setStatusFilter(v);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="pt-20">
        <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-16 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">All Opportunities</h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl">
              Browse our complete collection of grants, scholarships, fellowships, and programs curated for ambitious individuals.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Tabs
            value={statusFilter}
            onValueChange={(value) => onChangeStatus(value as 'Active' | 'Expired')}
            className="mb-6"
          >
            <TabsList className="grid h-auto w-full max-w-lg grid-cols-1 gap-2 bg-white border-2 border-slate-200 p-1 sm:h-12 sm:grid-cols-2 sm:gap-0 sm:p-0">
              <TabsTrigger
                value="Active"
                className="text-sm sm:text-base font-semibold data-[state=active]:bg-cyan-700 data-[state=active]:text-white"
              >
                Active Opportunities
              </TabsTrigger>
              <TabsTrigger
                value="Expired"
                className="text-sm sm:text-base font-semibold data-[state=active]:bg-slate-700 data-[state=active]:text-white"
              >
                Previous Opportunities
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="bg-white border-2 border-slate-200 rounded-xl p-4 md:p-5 mb-8 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-slate-700 leading-relaxed">
                <span className="font-semibold text-slate-900">Disclaimer:</span> Listings here are compiled from publicly available sources or submitted to Growth Forum for visibility. We do not represent the funders, and we do not guarantee accuracy, availability, deadlines, or outcomes. Always verify details on the official provider website before applying. Use caution when sharing personal, financial, or identity information. If you notice an issue or suspect a listing is unsafe, please report it to us.
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-xl p-6 md:p-8 mb-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-cyan-700" />
              <h2 className="text-xl font-bold text-slate-900">Filter Opportunities</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search by keyword..."
                    value={searchTerm}
                    onChange={(e) => onChangeSearch(e.target.value)}
                    className="pl-10 h-11 border-2 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                <Select value={selectedCategory} onValueChange={onChangeCategory}>
                  <SelectTrigger className="h-11 border-2 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                <Select value={selectedCountry} onValueChange={onChangeCountry}>
                  <SelectTrigger className="h-11 border-2 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Locations</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={onChangeSort}>
                  <SelectTrigger className="h-11 border-2 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deadline">Soonest Deadline</SelectItem>
                    <SelectItem value="latest">Latest Added</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-slate-600 text-lg">
              Showing <span className="font-bold text-slate-900">{items.length}</span> {statusLabel} {items.length === 1 ? 'opportunity' : 'opportunities'} on this page
            </p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={loading || page <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Prev
              </Button>

              <div className="text-sm text-slate-600 px-3">
                Page <span className="font-semibold text-slate-900">{page}</span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading || !hasNext}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {errorText ? (
            <div className="bg-white border-2 border-red-200 rounded-xl p-12 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Could not load opportunities</h3>
                <p className="text-slate-600 mb-6">{errorText}</p>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
              <p className="text-slate-600 font-medium">Loading opportunities...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white border-2 border-slate-200 rounded-xl p-12 text-center">
              <div className="max-w-md mx-auto">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No opportunities found</h3>
                <p className="text-slate-600">Try adjusting your filters or search terms to find what you&apos;re looking for.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((opportunity) => (
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
