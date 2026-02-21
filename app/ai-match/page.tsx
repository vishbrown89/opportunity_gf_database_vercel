import { AlertTriangle } from 'lucide-react';

import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import AiMatchForm from '@/components/ai-match-form';

export default function AiMatchPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="pt-20">
        <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_10%_0%,rgba(8,145,178,0.16),transparent_40%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_100%)] py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
              <div>
                <p className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                  Premium Matching Workflow
                </p>
                <h1 className="mt-5 text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                  AI Match Intake
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
                  Submit your profile links once, and the platform stores your match profile for opportunity recommendations and follow-up engagement.
                </p>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                    <p className="text-sm leading-relaxed text-slate-700">
                      Consent is required for data processing. Newsletter subscription remains optional and can be revoked any time.
                    </p>
                  </div>
                </div>
              </div>

              <AiMatchForm variant="page" sourcePage="ai-match-page" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
