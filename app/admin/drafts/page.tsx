'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CATEGORIES } from '@/lib/supabase';
import { normalizeCategory } from '@/lib/opportunity/category';

type Draft = {
  id: string | number;
  title: string;
  source_url: string;
  logo_url: string | null;
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
  categories: string[];
  country_or_region: string;
  deadline: string;
  logo_url: string;
  source_url: string;
  summary: string;
  full_description: string;
  eligibility: string;
  funding_or_benefits: string;
  tags: string;
};

type DraftStatusFilter = 'pending' | 'approved' | 'rejected';

const STATUS_LABELS: Record<DraftStatusFilter, string> = {
  pending: 'Pending approval',
  approved: 'Approved',
  rejected: 'Rejected',
};

function parseCategoryList(rawValue: unknown) {
  const raw = String(rawValue || '').trim();
  if (!raw) return [] as string[];

  const parts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const normalized = Array.from(new Set(parts.map((part) => normalizeCategory(part))));
  return normalized;
}

function toFormState(draft: Draft): DraftForm {
  return {
    title: draft.title || '',
    categories: parseCategoryList(draft.category),
    country_or_region: draft.country_or_region || '',
    deadline: draft.deadline || '',
    logo_url: draft.logo_url || '',
    source_url: draft.source_url || '',
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
  const [statusFilter, setStatusFilter] = useState<DraftStatusFilter>('pending');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DraftForm | null>(null);
  const [editingSourceUrl, setEditingSourceUrl] = useState<string>('');

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

  async function takeAction(draft: Draft, action: 'approve' | 'reject') {
    const response = await fetch('/api/admin/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: String(draft.id), source_url: draft.source_url, action }),
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
    setEditingSourceUrl(draft.source_url || '');
    setForm(toFormState(draft));
  }

  function toggleCategory(category: string, checked: boolean) {
    setForm((prev) => {
      if (!prev) return prev;
      const current = Array.isArray(prev.categories) ? prev.categories : [];
      if (checked) {
        return { ...prev, categories: Array.from(new Set([...current, category])) };
      }
      return { ...prev, categories: current.filter((item) => item !== category) };
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingSourceUrl('');
    setForm(null);
  }

  async function saveEdit(id: string | number) {
    if (!form) return;

    if (
      !form.title.trim() ||
      form.categories.length === 0 ||
      !form.country_or_region.trim() ||
      !form.deadline ||
      !form.source_url.trim() ||
      !form.summary.trim()
    ) {
      alert('Please fill required fields: Title, Category, Country/Region, Deadline, Source URL, Summary.');
      return;
    }

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
        id: String(id),
        source_url: form.source_url,
        original_source_url: editingSourceUrl,
        updates: {
          title: form.title,
          category: form.categories.join(', '),
          country_or_region: form.country_or_region,
          deadline: form.deadline,
          logo_url: form.logo_url,
          source_url: form.source_url,
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

  const statusCounts = useMemo(() => {
    return drafts.reduce(
      (acc, draft) => {
        const key = String(draft.status || '').toLowerCase() as DraftStatusFilter;
        if (key === 'pending' || key === 'approved' || key === 'rejected') {
          acc[key] += 1;
        }
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 }
    );
  }, [drafts]);

  const filteredDrafts = useMemo(() => {
    return drafts.filter((draft) => String(draft.status || '').toLowerCase() === statusFilter);
  }, [drafts, statusFilter]);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Draft Queue</h1>
        <p className="text-slate-600">Review, edit, and approve auto-scraped opportunities.</p>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2 border-b pb-3">
          {(Object.keys(STATUS_LABELS) as DraftStatusFilter[]).map((status) => (
            <Button
              key={status}
              type="button"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
            >
              {STATUS_LABELS[status]} ({statusCounts[status]})
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-slate-500">Loading...</div>
        ) : drafts.length === 0 ? (
          <div className="text-slate-500">No drafts yet.</div>
        ) : filteredDrafts.length === 0 ? (
          <div className="text-slate-500">No {STATUS_LABELS[statusFilter].toLowerCase()} drafts.</div>
        ) : (
          filteredDrafts.map((draft) => (
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
                      <Button onClick={() => takeAction(draft, 'approve')}>Approve</Button>
                      <Button variant="outline" onClick={() => takeAction(draft, 'reject')}>Reject</Button>
                    </>
                  ) : null}
                </div>
              </div>

              {editingId === draft.id && form ? (
                <div className="mt-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label htmlFor={`title-${draft.id}`}>Title *</Label>
                      <Input
                        id={`title-${draft.id}`}
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        disabled={saving}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Category * (select one or more)</Label>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border rounded-md p-3">
                        {CATEGORIES.map((category) => {
                          const checked = form.categories.includes(category);
                          return (
                            <label key={category} className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(next) => toggleCategory(category, Boolean(next))}
                                disabled={saving}
                              />
                              <span>{category}</span>
                            </label>
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Selected: {form.categories.length ? form.categories.join(', ') : 'None'}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor={`country-${draft.id}`}>Country/Region *</Label>
                      <Input
                        id={`country-${draft.id}`}
                        value={form.country_or_region}
                        onChange={(e) => setForm({ ...form, country_or_region: e.target.value })}
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`deadline-${draft.id}`}>Deadline *</Label>
                      <Input
                        id={`deadline-${draft.id}`}
                        type="date"
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        disabled={saving}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`logo-${draft.id}`}>Logo URL</Label>
                      <Input
                        id={`logo-${draft.id}`}
                        type="url"
                        value={form.logo_url}
                        onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        disabled={saving}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor={`source-${draft.id}`}>Source URL *</Label>
                      <Input
                        id={`source-${draft.id}`}
                        type="url"
                        value={form.source_url}
                        onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                        placeholder="https://example.com/apply"
                        disabled={saving}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor={`summary-${draft.id}`}>Summary *</Label>
                      <Textarea
                        id={`summary-${draft.id}`}
                        value={form.summary}
                        onChange={(e) => setForm({ ...form, summary: e.target.value })}
                        rows={3}
                        placeholder="Brief 2-3 sentence summary"
                        disabled={saving}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor={`full-${draft.id}`}>Full Description</Label>
                      <Textarea
                        id={`full-${draft.id}`}
                        value={form.full_description}
                        onChange={(e) => setForm({ ...form, full_description: e.target.value })}
                        rows={5}
                        disabled={saving}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor={`eligibility-${draft.id}`}>Eligibility</Label>
                      <Textarea
                        id={`eligibility-${draft.id}`}
                        value={form.eligibility}
                        onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                        rows={4}
                        disabled={saving}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor={`funding-${draft.id}`}>Funding & Benefits</Label>
                      <Textarea
                        id={`funding-${draft.id}`}
                        value={form.funding_or_benefits}
                        onChange={(e) => setForm({ ...form, funding_or_benefits: e.target.value })}
                        rows={4}
                        disabled={saving}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor={`tags-${draft.id}`}>Tags (comma-separated)</Label>
                      <Input
                        id={`tags-${draft.id}`}
                        value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                        placeholder="technology, research, funding"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-6">
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
