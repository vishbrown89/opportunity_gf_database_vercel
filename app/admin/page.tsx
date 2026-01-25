'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { getOpportunityStatus } from '@/lib/opportunity-utils';
import { TrendingUp, Clock, Archive, Calendar } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    active: 0,
    previous: 0,
    recentlyAdded: 0,
    total: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('*');

    if (opportunities) {
      const active = opportunities.filter(opp => getOpportunityStatus(opp.deadline) === 'Active').length;
      const previous = opportunities.filter(opp => getOpportunityStatus(opp.deadline) === 'Expired').length;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentlyAdded = opportunities.filter(
        opp => new Date(opp.date_added) >= thirtyDaysAgo
      ).length;

      setStats({
        active,
        previous,
        recentlyAdded,
        total: opportunities.length,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of your opportunities directory</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Opportunities</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.active}</div>
            <p className="text-xs text-slate-500 mt-1">Currently accepting applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Previous Opportunities</CardTitle>
            <Archive className="w-4 h-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.previous}</div>
            <p className="text-xs text-slate-500 mt-1">Past deadline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Added Last 30 Days</CardTitle>
            <Clock className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.recentlyAdded}</div>
            <p className="text-xs text-slate-500 mt-1">New this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Opportunities</CardTitle>
            <Calendar className="w-4 h-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/add"
              className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <h3 className="font-semibold text-slate-900 mb-1">Add New Opportunity</h3>
              <p className="text-sm text-slate-600">Manually create a new opportunity listing</p>
            </a>
            <a
              href="/admin/import-url"
              className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <h3 className="font-semibold text-slate-900 mb-1">Import from URL</h3>
              <p className="text-sm text-slate-600">Use AI to extract opportunity details from a website</p>
            </a>
            <a
              href="/admin/opportunities"
              className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <h3 className="font-semibold text-slate-900 mb-1">Manage Opportunities</h3>
              <p className="text-sm text-slate-600">View, edit, and delete existing opportunities</p>
            </a>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}