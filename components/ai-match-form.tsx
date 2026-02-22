'use client';

import { useMemo, useState } from 'react';
import { Loader2, Sparkles, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FormVariant = 'hero' | 'page';

type AiMatchFormProps = {
  variant?: FormVariant;
  sourcePage?: string;
};

type SubmitState = 'idle' | 'success' | 'error';

type MatchItem = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  country_or_region: string | null;
  deadline: string | null;
  source_url: string | null;
};

function formatDate(value: string | null) {
  if (!value) return 'No deadline listed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No deadline listed';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AiMatchForm({ variant = 'hero', sourcePage = 'home-hero' }: AiMatchFormProps) {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeUpload, setResumeUpload] = useState<File | null>(null);
  const [draggingResume, setDraggingResume] = useState(false);
  const [processingConsent, setProcessingConsent] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');
  const [matches, setMatches] = useState<MatchItem[]>([]);

  const wrapperClass = useMemo(() => {
    if (variant === 'page') {
      return 'rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] md:p-8';
    }

    return 'rounded-3xl border border-white/45 bg-white/92 p-6 shadow-[0_28px_80px_-32px_rgba(8,47,73,0.55)] backdrop-blur-xl md:p-8';
  }, [variant]);

  function selectResumeFile(file: File | null) {
    if (!file) {
      setResumeUpload(null);
      return;
    }

    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      setSubmitState('error');
      setMessage('Resume file is too large. Please upload a file up to 8MB.');
      return;
    }

    setResumeUpload(file);
    setSubmitState('idle');
    setMessage('');
  }

  async function copyToSelf(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      window.alert('Opportunity link copied. Share it to yourself anywhere.');
    } catch {
      window.alert(url);
    }
  }

  function shareToWhatsApp(title: string, url: string) {
    const text = `${title}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  function shareToLinkedIn(url: string) {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!processingConsent) {
      setSubmitState('error');
      setMessage('Please confirm data processing consent to continue.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitState('idle');
      setMessage('');
      setMatches([]);

      const formData = new FormData();
      formData.append('linkedinUrl', linkedinUrl);
      formData.append('resumeUrl', resumeUrl);
      formData.append('processingConsent', String(processingConsent));
      formData.append('newsletterConsent', String(newsletterConsent));
      formData.append('sourcePage', sourcePage);
      if (resumeUpload) {
        formData.append('resumeUpload', resumeUpload);
      }

      const response = await fetch('/api/ai-match-interest', {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || 'Could not generate AI matches.');
      }

      const matchItems = Array.isArray(payload?.matches) ? payload.matches : [];
      setMatches(matchItems);
      setSubmitState('success');
      setMessage(matchItems.length ? `Found ${matchItems.length} opportunities from our listings.` : 'No strong matches found right now. Please try again with more profile detail.');
    } catch (error) {
      setSubmitState('error');
      setMessage(error instanceof Error ? error.message : 'Unable to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={wrapperClass}>
      <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-800">
        <Sparkles className="h-3.5 w-3.5" />
        AI Matching
      </div>

      <h2 className="text-2xl font-semibold leading-tight text-slate-900 md:text-3xl">
        AI-Powered Opportunity Matching
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
        Add your LinkedIn URL and optional resume details. We will match you to relevant opportunities already listed on this website.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor={`linkedin-url-${variant}`}>
            LinkedIn profile URL
          </label>
          <Input
            id={`linkedin-url-${variant}`}
            type="url"
            required
            value={linkedinUrl}
            onChange={(event) => setLinkedinUrl(event.target.value)}
            placeholder="https://www.linkedin.com/in/your-profile"
            className="h-12 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor={`resume-url-${variant}`}>
            Resume URL (optional)
          </label>
          <Input
            id={`resume-url-${variant}`}
            type="url"
            value={resumeUrl}
            onChange={(event) => setResumeUrl(event.target.value)}
            placeholder="https://drive.google.com/..."
            className="h-12 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Resume upload (optional)
          </label>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDraggingResume(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDraggingResume(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDraggingResume(false);
              selectResumeFile(event.dataTransfer.files?.[0] || null);
            }}
            className={`rounded-xl border-2 border-dashed p-4 transition-colors ${draggingResume ? 'border-cyan-600 bg-cyan-50/70' : 'border-slate-300 bg-slate-50/70'}`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-700">
                <div className="font-medium">Drag and drop your resume here</div>
                <div className="text-slate-500">or upload from your device. Max 8MB.</div>
              </div>

              <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                <Upload className="mr-2 h-4 w-4" />
                Choose file
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={(event) => selectResumeFile(event.target.files?.[0] || null)}
                />
              </label>
            </div>

            {resumeUpload && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <span className="line-clamp-1 text-slate-700">{resumeUpload.name}</span>
                <button
                  type="button"
                  onClick={() => setResumeUpload(null)}
                  className="inline-flex items-center text-slate-500 hover:text-slate-700"
                  aria-label="Remove uploaded resume"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-700">
          <input
            type="checkbox"
            required
            checked={processingConsent}
            onChange={(event) => setProcessingConsent(event.target.checked)}
            className="mt-1 h-4 w-4 accent-cyan-700"
          />
          <span>I agree to the processing and storage of my information to generate personalized opportunity matches.</span>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={newsletterConsent}
            onChange={(event) => setNewsletterConsent(event.target.checked)}
            className="mt-1 h-4 w-4 accent-cyan-700"
          />
          <span>I would like to receive newsletters and product updates by email. I can unsubscribe anytime.</span>
        </label>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full bg-slate-900 text-white hover:bg-slate-800"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Matching opportunities
            </>
          ) : (
            'Get My AI Match'
          )}
        </Button>

        {message && (
          <p className={`text-sm ${submitState === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>{message}</p>
        )}
      </form>

      {matches.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Your Matched Opportunities</h3>

          <div className="space-y-3">
            {matches.map((item) => {
              const opportunityUrl = `/opportunity/${item.slug}`;
              const absoluteUrl = typeof window !== 'undefined' ? `${window.location.origin}${opportunityUrl}` : opportunityUrl;

              return (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{item.title}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {[item.category, item.country_or_region].filter(Boolean).join(' • ') || 'Opportunity'}
                      </div>
                      <div className="mt-1 text-xs font-medium text-slate-500">Deadline: {formatDate(item.deadline)}</div>
                    </div>
                  </div>

                  {item.summary && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{item.summary}</p>}

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <a
                      href={opportunityUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Visit Opportunity
                    </a>

                    <button
                      type="button"
                      onClick={() => copyToSelf(absoluteUrl)}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Share to Myself
                    </button>

                    <button
                      type="button"
                      onClick={() => shareToLinkedIn(absoluteUrl)}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-[#0A66C2] px-3 text-sm font-semibold text-[#0A66C2] hover:bg-[#EAF4FF]"
                    >
                      Share LinkedIn
                    </button>

                    <button
                      type="button"
                      onClick={() => shareToWhatsApp(item.title, absoluteUrl)}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-[#25D366] px-3 text-sm font-semibold text-[#1F9E4B] hover:bg-[#ECFDF3]"
                    >
                      Share WhatsApp
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
