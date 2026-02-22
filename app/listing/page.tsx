import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Compass, Crown, ShieldCheck, Sparkles } from 'lucide-react';

import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

const PACKAGES = [
  {
    name: 'Opportunity Listing Basic',
    price: 'RM 199',
    href: 'https://buy.stripe.com/eVq9AT3uN7cJ0QE4VP5EY00',
    subtitle: 'Structured listing for clear discoverability',
    highlights: [
      'Published on opportunities.growthforum.my',
      'Included in search and relevant category pages',
      'Quality check for clarity and completeness',
      'Listing validity period: 30 days',
    ],
    badge: 'Best for first listing',
    tone: 'standard',
  },
  {
    name: 'Opportunity Listing Standard',
    price: 'RM 399',
    href: 'https://buy.stripe.com/aFa5kDghz54B56Udsl5EY01',
    subtitle: 'Priority placement for stronger exposure',
    highlights: [
      'Everything in Basic',
      'Priority placement in listings',
      'Social amplification when relevant',
      'Faster review turnaround',
    ],
    badge: 'Most selected',
    tone: 'featured',
  },
  {
    name: 'Opportunity Listing Premium',
    price: 'RM 699',
    href: 'https://buy.stripe.com/9B69ATfdv0Ol0QEfAt5EY02',
    subtitle: 'Top-tier visibility and premium support',
    highlights: [
      'Everything in Standard',
      'Top placement for a defined period',
      'Featured tag where applicable',
      'Priority support and edits',
    ],
    badge: 'Maximum visibility',
    tone: 'premium',
  },
] as const;

const FAQ = [
  {
    q: 'What happens after payment?',
    a: 'You will be redirected to a short submission form to provide the opportunity details. Once submitted, we review it for quality and publish it.',
  },
  {
    q: 'How fast will my opportunity go live?',
    a: 'Most listings are reviewed quickly. If details are complete and clear, publication is faster. Standard and Premium receive higher priority.',
  },
  {
    q: 'Do you verify opportunities?',
    a: 'Yes. We conduct a basic verification for legitimacy, clarity, and correct links. We may request clarifications when needed.',
  },
  {
    q: 'Can I edit my listing later?',
    a: 'Yes. Reply to your confirmation email or contact us with the listing title and update request. Premium includes priority edits.',
  },
];

export default function ListingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="pt-20">
        <section className="border-b border-slate-200 bg-[linear-gradient(160deg,#f8fbff_0%,#f7fafc_50%,#f3f6fb_100%)] py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_30px_70px_-50px_rgba(15,23,42,0.75)]">
              <div className="grid gap-0 lg:grid-cols-[1.16fr_0.84fr]">
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-900">
                    <Sparkles className="h-3.5 w-3.5" />
                    Listing Partnership
                  </div>

                  <h1 className="mt-5 text-4xl font-semibold leading-[1.03] text-slate-900 md:text-[3.15rem]">
                    List Your Opportunity
                    <span className="block text-slate-700">with a Premium Editorial Standard</span>
                  </h1>

                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
                    Publish your opportunity to a high-intent global audience. We structure your listing for clarity, trust, and faster decision-making.
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <a
                      href="#packages"
                      className="inline-flex h-12 items-center justify-center rounded-lg bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                      Choose a Package
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>

                    <Link
                      href="/submit-listing"
                      className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                    >
                      Go to Submission Form
                    </Link>
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-slate-50 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Quick Navigation</div>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <Link
                      href="/"
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                    >
                      <Compass className="mr-2 h-4 w-4" />
                      Opportunities Homepage
                    </Link>

                    <Link
                      href="/opportunities"
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                    >
                      <BriefcaseBusiness className="mr-2 h-4 w-4" />
                      Browse Opportunities
                    </Link>

                    <a
                      href="https://growthforum.my"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                    >
                      Growth Forum Main Website
                    </a>

                    <a
                      href="https://growthforum.my/contact/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                    >
                      Contact Us
                    </a>
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-900">What to prepare</div>
                    <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                      <li>Official source link and application link</li>
                      <li>Eligibility details and key dates</li>
                      <li>Clear short summary for faster approval</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="packages" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-2">
            <h2 className="text-3xl font-semibold text-slate-900">Listing Packages</h2>
            <p className="text-slate-600">
              Payment is processed securely via Stripe. After payment, proceed to the submission form and share your listing details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PACKAGES.map((pkg) => {
              const featured = pkg.tone === 'featured';
              const premium = pkg.tone === 'premium';

              return (
                <article
                  key={pkg.name}
                  className={`relative flex h-full flex-col rounded-2xl border p-6 transition-shadow ${
                    featured
                      ? 'border-cyan-300 bg-[linear-gradient(170deg,#ffffff_0%,#f3fbff_100%)] shadow-[0_24px_50px_-36px_rgba(8,145,178,0.55)]'
                      : premium
                        ? 'border-slate-300 bg-[linear-gradient(170deg,#ffffff_0%,#f8f8ff_100%)] shadow-[0_24px_50px_-36px_rgba(51,65,85,0.5)]'
                        : 'border-slate-200 bg-white shadow-[0_16px_40px_-34px_rgba(15,23,42,0.45)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{pkg.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{pkg.subtitle}</p>
                    </div>
                    <div className="rounded-lg bg-slate-900 px-3 py-1 text-sm font-semibold text-white">{pkg.price}</div>
                  </div>

                  <div className="mt-4 inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
                    {featured && <Crown className="mr-1.5 h-3.5 w-3.5 text-amber-600" />}
                    {pkg.badge}
                  </div>

                  <ul className="mt-5 space-y-3 text-sm text-slate-700">
                    {pkg.highlights.map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-700" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex-1" />

                  <a
                    href={pkg.href}
                    className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    Pay with Stripe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>

                  <p className="mt-3 text-xs text-slate-500">You will be redirected to the submission form after payment.</p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Before You Submit</h3>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                  Clear and complete listings are approved faster. If your opportunity is time-sensitive, Standard or Premium is recommended for priority handling.
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-cyan-700" />
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-slate-900">Frequently Asked Questions</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {FAQ.map((item) => (
                <article key={item.q} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="font-semibold text-slate-900">{item.q}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold">Ready to publish your opportunity?</h3>
                <p className="mt-1 text-sm text-slate-300">Pick a package and proceed to the submission form in under 2 minutes.</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  href="#packages"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                >
                  Choose Package
                </a>
                <Link
                  href="/submit-listing"
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-white/35 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Submission Form
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
