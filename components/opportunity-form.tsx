'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase, CATEGORIES, Opportunity } from '@/lib/supabase';
import { generateSlug } from '@/lib/opportunity-utils';

interface OpportunityFormProps {
  opportunity?: Opportunity;
  isEdit?: boolean;
}

export default function OpportunityForm({ opportunity, isEdit = false }: OpportunityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: opportunity?.title || '',
    category: opportunity?.category || '',
    country_or_region: opportunity?.country_or_region || '',
    deadline: opportunity?.deadline || '',
    summary: opportunity?.summary || '',
    full_description: opportunity?.full_description || '',
    eligibility: opportunity?.eligibility || '',
    funding_or_benefits: opportunity?.funding_or_benefits || '',
    tags: opportunity?.tags?.join(', ') || '',
    source_url: opportunity?.source_url || '',
    logo_url: opportunity?.logo_url || '',
    featured: opportunity?.featured || false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const slug = generateSlug(formData.title);

      const opportunityData = {
        title: formData.title,
        slug,
        category: formData.category,
        country_or_region: formData.country_or_region,
        deadline: formData.deadline,
        summary: formData.summary,
        full_description: formData.full_description || null,
        eligibility: formData.eligibility || null,
        funding_or_benefits: formData.funding_or_benefits || null,
        tags: tagsArray,
        source_url: formData.source_url,
        logo_url: formData.logo_url || null,
        featured: formData.featured,
      };

      if (isEdit && opportunity) {
        const response = await fetch('/api/admin/opportunities', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: opportunity.id, ...opportunityData }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to update');
      } else {
        const response = await fetch('/api/admin/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opportunityData),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to create');
      }

      router.push('/admin/opportunities');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => handleChange('category', value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="country_or_region">Country/Region *</Label>
          <Input
            id="country_or_region"
            value={formData.country_or_region}
            onChange={(e) => handleChange('country_or_region', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="deadline">Deadline *</Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="logo_url">Logo URL</Label>
          <Input
            id="logo_url"
            type="url"
            value={formData.logo_url}
            onChange={(e) => handleChange('logo_url', e.target.value)}
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="source_url">Source URL *</Label>
          <Input
            id="source_url"
            type="url"
            value={formData.source_url}
            onChange={(e) => handleChange('source_url', e.target.value)}
            placeholder="https://example.com/apply"
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="summary">Summary *</Label>
          <Textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            rows={3}
            placeholder="Brief 2-3 sentence summary"
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="full_description">Full Description</Label>
          <Textarea
            id="full_description"
            value={formData.full_description}
            onChange={(e) => handleChange('full_description', e.target.value)}
            rows={5}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="eligibility">Eligibility</Label>
          <Textarea
            id="eligibility"
            value={formData.eligibility}
            onChange={(e) => handleChange('eligibility', e.target.value)}
            rows={4}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="funding_or_benefits">Funding & Benefits</Label>
          <Textarea
            id="funding_or_benefits"
            value={formData.funding_or_benefits}
            onChange={(e) => handleChange('funding_or_benefits', e.target.value)}
            rows={4}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="technology, research, funding"
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleChange('featured', checked)}
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Featured opportunity
            </Label>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? 'Saving...' : isEdit ? 'Update Opportunity' : 'Create Opportunity'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/opportunities')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}