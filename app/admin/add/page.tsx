'use client';

import AdminLayout from '@/components/admin-layout';
import OpportunityForm from '@/components/opportunity-form';

export default function AddOpportunityPage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Add New Opportunity</h1>
        <p className="text-slate-600">Create a new opportunity listing</p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <OpportunityForm />
      </div>
    </AdminLayout>
  );
}