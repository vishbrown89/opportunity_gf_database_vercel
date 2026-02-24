'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { CATEGORIES, Opportunity } from '@/lib/supabase'
import { generateSlug } from '@/lib/opportunity-utils'
import { normalizeCategory } from '@/lib/opportunity/category'

interface OpportunityFormProps {
  opportunity?: Opportunity
  isEdit?: boolean
}

function parseCategoryList(rawValue: unknown) {
  const raw = String(rawValue || '').trim()
  if (!raw) return [] as string[]

  const parts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  const normalized = Array.from(new Set(parts.map((part) => normalizeCategory(part))))
  return normalized
}

export default function OpportunityForm({ opportunity, isEdit = false }: OpportunityFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: opportunity?.title || '',
    categories: parseCategoryList(opportunity?.category),
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
  })

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleCategory = (category: string, checked: boolean) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.categories) ? prev.categories : []
      if (checked) {
        return { ...prev, categories: Array.from(new Set([...current, category])) }
      }
      return { ...prev, categories: current.filter((item) => item !== category) }
    })
  }

  const buildPayload = () => {
    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const title = formData.title.trim()
    const slug = generateSlug(title)

    return {
      title,
      slug,
      category: formData.categories.join(', '),
      country_or_region: formData.country_or_region.trim(),
      deadline: formData.deadline,
      summary: formData.summary.trim(),
      full_description: formData.full_description?.trim() ? formData.full_description.trim() : null,
      eligibility: formData.eligibility?.trim() ? formData.eligibility.trim() : null,
      funding_or_benefits: formData.funding_or_benefits?.trim() ? formData.funding_or_benefits.trim() : null,
      tags: tagsArray,
      source_url: formData.source_url.trim(),
      logo_url: formData.logo_url?.trim() ? formData.logo_url.trim() : null,
      featured: Boolean(formData.featured),
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.categories.length) {
        throw new Error('Please select at least one category')
      }

      const payload = buildPayload()

      const response = await fetch('/api/admin/opportunities', {
        method: isEdit && opportunity ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEdit && opportunity ? { id: opportunity.id, ...payload } : payload
        ),
        credentials: 'include',
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to save opportunity')
      }

      router.push('/admin/opportunities')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

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
            disabled={loading}
          />
        </div>

        <div className="md:col-span-2">
          <Label>Category * (select one or more)</Label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border rounded-md p-3">
            {CATEGORIES.map((category) => {
              const checked = formData.categories.includes(category)
              return (
                <label key={category} className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) => toggleCategory(category, Boolean(next))}
                    disabled={loading}
                  />
                  <span>{category}</span>
                </label>
              )
            })}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Selected: {formData.categories.length ? formData.categories.join(', ') : 'None'}
          </p>
        </div>

        <div>
          <Label htmlFor="country_or_region">Country/Region *</Label>
          <Input
            id="country_or_region"
            value={formData.country_or_region}
            onChange={(e) => handleChange('country_or_region', e.target.value)}
            required
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="full_description">Full Description</Label>
          <Textarea
            id="full_description"
            value={formData.full_description}
            onChange={(e) => handleChange('full_description', e.target.value)}
            rows={5}
            disabled={loading}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="eligibility">Eligibility</Label>
          <Textarea
            id="eligibility"
            value={formData.eligibility}
            onChange={(e) => handleChange('eligibility', e.target.value)}
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="funding_or_benefits">Funding & Benefits</Label>
          <Textarea
            id="funding_or_benefits"
            value={formData.funding_or_benefits}
            onChange={(e) => handleChange('funding_or_benefits', e.target.value)}
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="technology, research, funding"
            disabled={loading}
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleChange('featured', Boolean(checked))}
              disabled={loading}
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
        <Button type="button" variant="outline" onClick={() => router.push('/admin/opportunities')} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
