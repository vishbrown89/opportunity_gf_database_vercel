'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin-layout';
import OpportunityForm from '@/components/opportunity-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Opportunity } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function ImportUrlPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState<Partial<Opportunity> | null>(null);

  const handleExtract = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Missing Supabase env. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY exist in Bolt Secrets.');
      }

      const endpoint = `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/extract-opportunity`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ url: trimmed }),
      });

      const raw = await response.text();

      if (!response.ok) {
        let msg = `Failed to extract opportunity data (${response.status})`;
        try {
          const j = JSON.parse(raw);
          msg = j?.error || j?.message || msg;
          if (j?.details) msg = `${msg}\n${String(j.details)}`;
        } catch {
          if (raw) msg = `${msg}\n${raw}`;
        }
        throw new Error(msg);
      }

      const data = JSON.parse(raw);
      setExtractedData(data);
    } catch (err: any) {
      setError(err?.message || 'An error occurred while extracting data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Import from URL</h1>
        <p className="text-slate-600">Use AI to extract opportunity details from a website</p>
      </div>

      {!extractedData ? (
        <Card>
          <CardHeader>
            <CardTitle>Enter Opportunity URL</CardTitle>
            <CardDescription>
              Paste the URL of the opportunity page. Our AI will extract and pre-fill the details for you to review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="url">Opportunity URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/opportunity"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded whitespace-pre-wrap">
                  {error}
                </div>
              ) : null}

              <div className="flex gap-4">
                <Button onClick={handleExtract} disabled={loading || !url.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {loading ? 'Extracting...' : 'Extract Opportunity Data'}
                </Button>
                <Button variant="outline" onClick={() => router.push('/admin/add')}>
                  Manual Entry Instead
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Paste the URL of an opportunity page</li>
                  <li>AI extracts key information from the page</li>
                  <li>Review and edit the pre-filled form</li>
                  <li>Save the opportunity to the directory</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Review Extracted Data</h2>
              <Button variant="outline" onClick={() => setExtractedData(null)}>
                Start Over
              </Button>
            </div>
            <p className="text-sm text-slate-600">
              The AI has extracted the following information. Please review and edit as needed before saving.
            </p>
          </div>
          <OpportunityForm opportunity={extractedData as any} />
        </div>
      )}
    </AdminLayout>
  );
}
