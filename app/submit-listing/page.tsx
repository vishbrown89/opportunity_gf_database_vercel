import Link from 'next/link';
import { CheckCircle2, ExternalLink, FileCheck2, ShieldCheck } from 'lucide-react';

import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

export default function SubmitListingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="pt-20">
        <section className="border-b border-slate-200 bg-[linear-gradient(155deg,#f8fbff_0%,#f7fafc_40%,#f3f6fb_100%)] py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_30px_70px_-48px_rgba(15,23,42,0.72)]">
              <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="p-6 sm:p-8 lg:p-10">
                  <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">Submit Your Opportunity Details</h1>

                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
                    If payment is complete, submit your opportunity details below. Our editorial team reviews and formats each listing before publication.
                  </p>

                  <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                    Please use the same email used during Stripe checkout. Submissions without a matching payment may not be published.
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-900">
                        <CheckCircle2 className="h-5 w-5 text-cyan-700" />
                        <span className="font-semibold">Structured listing</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">Your listing is standardized for better readability and discovery.</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-900">
                        <ShieldCheck className="h-5 w-5 text-cyan-700" />
                        <span className="font-semibold">Quality review</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">We verify links, key dates, and clarity before publishing.</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-900">
                        <ExternalLink className="h-5 w-5 text-cyan-700" />
                        <span className="font-semibold">Fast follow up</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">If anything is unclear, we contact you promptly for clarification.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-slate-50 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Quick Navigation</div>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <Link
                      href="/listing"
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                    >
                      Back to Listing Packages
                    </Link>

                    <Link
                      href="/opportunities"
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                    >
                      Browse Opportunities
                    </Link>

                    <a
                      href="https://growthforum.my/contact/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                    >
                      Contact Support
                    </a>
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <FileCheck2 className="h-5 w-5 text-cyan-700" />
                      <span className="font-semibold">Recommended checklist</span>
                    </div>
                    <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                      <li>Official source and application links</li>
                      <li>Eligible profiles and geographies</li>
                      <li>Deadline and key timeline details</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="font-semibold text-slate-900">Opportunity submission form</div>
              <div className="mt-1 text-sm text-slate-600">Complete all required fields for faster review.</div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <iframe
                  src="https://forms.office.com/Pages/ResponsePage.aspx?id=fM_ohRtFI0ioi0vpXp_EDpLTsR6xbLpHmP9URIHMCQ5UNUhUQlUzS0gwTEEzNjU5TzVaNkJENVNPTy4u&embed=true"
                  width="100%"
                  height="1800"
                  frameBorder={0}
                  marginWidth={0}
                  marginHeight={0}
                  style={{ border: 'none', display: 'block' }}
                  allowFullScreen
                />
              </div>

              <p className="mt-4 text-xs text-slate-500">
                By submitting, you confirm you have the right to share this opportunity content and links for publication.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
