'use client';

import { useMemo, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FormVariant = 'hero' | 'page';

type AiMatchFormProps = {
  variant?: FormVariant;
  sourcePage?: string;
};

type SubmitState = 'idle' | 'success' | 'error';

export default function AiMatchForm({ variant = 'hero', sourcePage = 'home-hero' }: AiMatchFormProps) {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [processingConsent, setProcessingConsent] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');

  const wrapperClass = useMemo(() => {
    if (variant === 'page') {
      return 'rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] md:p-8';
    }

    return 'rounded-3xl border border-white/45 bg-white/92 p-6 shadow-[0_28px_80px_-32px_rgba(8,47,73,0.55)] backdrop-blur-xl md:p-8';
  }, [variant]);

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

      const response = await fetch('/api/ai-match-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedinUrl,
          resumeUrl,
          processingConsent,
          newsletterConsent,
          sourcePage,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || 'Could not submit your profile.');
      }

      setSubmitState('success');
      setMessage('Profile captured successfully. Your AI match report is being prepared.');
      setLinkedinUrl('');
      setResumeUrl('');
      setProcessingConsent(false);
      setNewsletterConsent(false);
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
        Provide your LinkedIn profile link for AI-powered matching to the most relevant opportunities and funding options.
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
              Submitting profile
            </>
          ) : (
            'Get My AI Match'
          )}
        </Button>

        {message && (
          <p className={`text-sm ${submitState === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>{message}</p>
        )}
      </form>
    </div>
  );
}
