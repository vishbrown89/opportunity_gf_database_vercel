'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Draft = {
  id: number;
  title: string;
  source_url: string;
  summary: string | null;
  full_description: string | null;
  eligibility: string | null;
  funding_or_benefits: string | null;
  deadline: string | null;
  category: string | null;
  country_or_region: string | null;
  tags: string[] | null;
  status: string;
  extraction_error: string | null;
  created_at: string;
};

type DraftForm = {
  title: string;
  source_url: string;
  category: string;
  country_or_region: string;
  deadline: string;
  summary: string;
  full_description: string;
  eligibility: string;
  funding_or_benefits: string;
  tags: string;
};

function toFormState(draft: Draft): DraftForm {
  return {
    title: draft.title || '',
    source_url: draft.source_url || '',
    category: draft.category || '',
    country_or_region: draft.country_or_region || '',
    deadline: draft.deadline || '',
    summary: draft.summary || '',
    full_description: draft.full_description || '',
    eligibility: draft.eligibility || '',
    funding_or_benefits: draft.funding_or_benefits || '',
    tags: Array.isArray(draft.tags) ? draft.tags.join(', ') : '',
  };
}

export default function AdminDraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DraftForm | null>(null);

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

  function startEdit(draft: Draft) {
    setEditingId(draft.id);
    setForm(toFormState(draft));
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(null);
  }

  async function saveEdit(id: number) {
    if (!form) return;

    const tagList = form.tags
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    setSaving(true);
    const response = await fetch('/api/admin/drafts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        id,
        updates: {
          title: form.title,
          source_url: form.source_url,
          category: form.category,
          country_or_region: form.country_or_region,
          deadline: form.deadline,
          summary: form.summary,
          full_description: form.full_description,
          eligibility: form.eligibility,
          funding_or_benefits: form.funding_or_benefits,
          tags: tagList,
        },
      }),
    });

    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      alert(data?.error || 'Save failed');
      return;
    }

    await load();
    cancelEdit();
  }

  const currentlyEditing = useMemo(() => {
    if (!editingId) return null;
    return drafts.find((draft) => draft.id === editingId) || null;
  }, [editingId, drafts]);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Draft Queue</h1>
        <p className="text-slate-600">Review, edit, and approve auto-scraped opportunities.</p>
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
                      <Button variant="outline" onClick={() => startEdit(draft)}>Edit</Button>
                      <Button onClick={() => takeAction(draft.id, 'approve')}>Approve</Button>
                      <Button variant="outline" onClick={() => takeAction(draft.id, 'reject')}>Reject</Button>
                    </>
                  ) : null}
                </div>
              </div>

              {editingId === draft.id && form ? (
                <div className="mt-4 border-t pt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Title"
                    />
                    <Input
                      value={form.source_url}
                      onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                      placeholder="Source URL"
                    />
                    <Input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="Category"
                    />
                    <Input
                      value={form.country_or_region}
                      onChange={(e) => setForm({ ...form, country_or_region: e.target.value })}
                      placeholder="Country or Region"
                    />
                    <Input
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      placeholder="Deadline (YYYY-MM-DD)"
                    />
                    <Input
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      placeholder="Tags (comma separated)"
                    />
                  </div>

                  <Textarea
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    placeholder="Summary"
                    className="min-h-[90px]"
                  />

                  <Textarea
                    value={form.full_description}
                    onChange={(e) => setForm({ ...form, full_description: e.target.value })}
                    placeholder="Full Description"
                    className="min-h-[140px]"
                  />

                  <Textarea
                    value={form.eligibility}
                    onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                    placeholder="Eligibility"
                    className="min-h-[90px]"
                  />

                  <Textarea
                    value={form.funding_or_benefits}
                    onChange={(e) => setForm({ ...form, funding_or_benefits: e.target.value })}
                    placeholder="Funding or Benefits"
                    className="min-h-[90px]"
                  />

                  <div className="flex items-center gap-2">
                    <Button onClick={() => saveEdit(draft.id)} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={cancelEdit} disabled={saving}>Cancel</Button>
                  </div>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      {editingId && !currentlyEditing ? (
        <div className="mt-4 text-sm text-red-600">Edited draft no longer exists. Please refresh.</div>
      ) : null}
    </AdminLayout>
  );
}
