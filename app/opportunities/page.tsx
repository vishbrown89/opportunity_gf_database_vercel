'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import OpportunityCard from '@/components/opportunity-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase, CATEGORIES, Opportunity } from '@/lib/supabase';
import { getOpportunityStatus } from '@/lib/opportunity-utils';
import { Search, Filter, AlertTriangle } from 'lucide-react';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [sortBy, setSortBy] = useState('deadline');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Expired'>('Active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOpportunities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [opportunities, searchTerm, selectedCategory, selectedCountry, sortBy, statusFilter]);

  const loadOpportunities = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('opportunities')
      .select('*')
      .order('date_added', { ascending: false });

    setOpportunities(data || []);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...opportunities];

    filtered = filtered.filter((opp) => {
      const status = getOpportunityStatus(opp.deadline);
      return status === statusFilter;
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((opp) =>
        opp.title.toLowerCase().includes(term) ||
        opp.summary.toLowerCase().includes(term) ||
        (opp.tags || []).some((tag) => tag.toLowerCase().includes(term))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((opp) => opp.category === selectedCategory);
    }

    if (selectedCountry !== 'All') {
      filtered = filtered.filter((opp) => opp.country_or_region === selectedCountry);
    }

    if (sortBy === 'deadline') {
      filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime());
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredOpportunities(filtered);
  };

  const countries = Array.from(new Set(opportunities.map((opp) => opp.country_or_region))).sort();

  const statusLabel = statusFilter === 'Active' ? 'active' : 'previous';

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
            onValueChange={(value) => setStatusFilter(value as 'Active' | 'Expired')}
            className="mb-6"
          >
            <TabsList className="grid w-full max-w-lg grid-cols-2 h-12 bg-white border-2 border-slate-200">
              <TabsTrigger
                value="Active"
                className="text-base font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Active Opportunities
              </TabsTrigger>
              <TabsTrigger
                value="Expired"
                className="text-base font-semibold data-[state=active]:bg-slate-700 data-[state=active]:text-white"
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
              <Filter className="w-5 h-5 text-blue-600" />
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 border-2 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
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
                <Select value={sortBy} onValueChange={setSortBy}>
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

          <div className="mb-6 flex items-center justify-between">
            <p className="text-slate-600 text-lg">
              Found <span className="font-bold text-slate-900">{filteredOpportunities.length}</span> {statusLabel} {filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
              <p className="text-slate-600 font-medium">Loading opportunities...</p>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="bg-white border-2 border-slate-200 rounded-xl p-12 text-center">
              <div className="max-w-md mx-auto">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No opportunities found</h3>
                <p className="text-slate-600">Try adjusting your filters or search terms to find what you're looking for.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.map((opportunity) => (
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
