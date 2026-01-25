import Link from "next/link";
import { CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";

export default function SubmitListingPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Submit your opportunity details
            </h1>
            <p className="mt-3 text-slate-600">
              If you have completed payment, fill in the form below. We review submissions for quality and publish them in the directory.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Structured listing</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Your listing will follow a consistent format for easier discovery.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Quality review</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  We check links, deadlines, and clarity before publishing.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900">
                  <ExternalLink className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Fast follow up</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  If we need clarification, we will reach out using your submission email.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Please use the same email you used during Stripe checkout. Submissions without a matching payment may not be published.
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/listing"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Back to packages
              </Link>

              <Link
                href="/opportunities"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
              >
                View opportunities directory
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="font-semibold text-slate-900">Opportunity submission form</div>
            <div className="mt-1 text-sm text-slate-600">
              Complete all required fields for faster review.
            </div>
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
                style={{ border: "none", display: "block" }}
                allowFullScreen
              />
            </div>

            <div className="mt-4 text-xs text-slate-500">
              By submitting, you confirm you have the right to share this opportunity content and links for publication.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
