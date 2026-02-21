'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Draft = {
  id: number;
  title: string;
  source_url: string;
  deadline: string | null;
  category: string | null;
  country_or_region: string | null;
  status: string;
  extraction_error: string | null;
  created_at: string;
};

export default function AdminDraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const response = await fetch('/api/admin/drafts', { credentials: 'include', cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    setDrafts(Array.isArray(data?.drafts) ? data.drafts : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function takeAction(id: number, action: 'approve' | 'reject') {
    const response = await fetch('/api/admin/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(data?.error || 'Action failed');
      return;
    }

    await load();
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Draft Queue</h1>
        <p className="text-slate-600">Review and approve auto-scraped opportunities.</p>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-3">
        {loading ? (
          <div className="text-slate-500">Loading...</div>
        ) : drafts.length === 0 ? (
          <div className="text-slate-500">No drafts yet.</div>
        ) : (
          drafts.map((draft) => (
            <div key={draft.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{draft.title}</h3>
                  <p className="text-sm text-slate-600 break-all">{draft.source_url}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {draft.category || 'No category'} | {draft.country_or_region || 'No region'} | Deadline: {draft.deadline || 'Not detected'}
                  </p>
                  {draft.extraction_error ? (
                    <p className="text-sm text-red-600 mt-1">Extract issue: {draft.extraction_error}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={draft.status === 'pending' ? 'secondary' : 'outline'}>{draft.status}</Badge>
                  {draft.status === 'pending' ? (
                    <>
                      <Button onClick={() => takeAction(draft.id, 'approve')}>Approve</Button>
                      <Button variant="outline" onClick={() => takeAction(draft.id, 'reject')}>Reject</Button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
