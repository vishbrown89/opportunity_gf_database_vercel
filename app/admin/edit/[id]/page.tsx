'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '@/components/admin-layout';
import OpportunityForm from '@/components/opportunity-form';
import { supabase, Opportunity } from '@/lib/supabase';

export default function EditOpportunityPage() {
  const params = useParams();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOpportunity();
  }, [params.id]);

  const loadOpportunity = async () => {
    const { data } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    setOpportunity(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">Loading...</div>
      </AdminLayout>
    );
  }

  if (!opportunity) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-red-600">Opportunity not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Opportunity</h1>
        <p className="text-slate-600">Update opportunity details</p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <OpportunityForm opportunity={opportunity} isEdit={true} />
      </div>
    </AdminLayout>
  );
}