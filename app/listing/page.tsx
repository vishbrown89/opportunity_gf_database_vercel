import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

const PACKAGES = [
  {
    name: "Opportunity Listing Basic",
    price: "RM 199",
    href: "https://buy.stripe.com/eVq9AT3uN7cJ0QE4VP5EY00",
    subtitle: "Standard placement across search and category pages",
    highlights: [
      "Published on opportunities.growthforum.my",
      "Included in search and relevant category pages",
      "Quality check for clarity and completeness",
      "Listing validity period: 30 days",
    ],
    badge: "Most popular for first time",
  },
  {
    name: "Opportunity Listing Standard",
    price: "RM 399",
    href: "https://buy.stripe.com/aFa5kDghz54B56Udsl5EY01",
    subtitle: "More visibility for time sensitive calls",
    highlights: [
      "Everything in Basic",
      "Priority placement in listings",
      "Social amplification when relevant",
      "Faster review turnaround",
    ],
    badge: "Best for deadlines",
  },
  {
    name: "Opportunity Listing Premium",
    price: "RM 699",
    href: "https://buy.stripe.com/9B69ATfdv0Ol0QEfAt5EY02",
    subtitle: "Top visibility and promotion",
    highlights: [
      "Everything in Standard",
      "Top placement for a defined period",
      "Featured tag where applicable",
      "Priority support and edits",
    ],
    badge: "Maximum visibility",
  },
];

const FAQ = [
  {
    q: "What happens after payment?",
    a: "You will be redirected to a short submission form to provide the opportunity details. Once submitted, we review it for quality and publish it.",
  },
  {
    q: "How fast will my opportunity go live?",
    a: "Most listings are reviewed quickly. If details are complete and clear, we can publish faster. Standard and Premium receive higher priority.",
  },
  {
    q: "Do you verify opportunities?",
    a: "Yes. We do a basic verification for legitimacy, clarity, and correct links. We may request clarifications if something looks incomplete.",
  },
  {
    q: "Can I edit my listing later?",
    a: "Yes. Reply to your confirmation email or contact us with the listing title and update request. Premium includes priority edits.",
  },
];

export default function ListingPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-white" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Publish on Growth Forum Opportunities Directory
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Promote your opportunity to a growth focused community
            </h1>

            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              We help organizations share grants, scholarships, fellowships, programmes, jobs, conferences,
              workshops, trainings, volunteering and more. Submit once, we format it cleanly and publish it
              so it is easy to discover and share.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
  <a
    href="#packages"
    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700"
  >
    Choose a package
    <ArrowRight className="ml-2 h-4 w-4" />
  </a>

  <Link
    href="/opportunities"
    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
  >
    View opportunities directory
  </Link>

  <Link
    href="/"
    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
  >
    Back to Opportunities main page
  </Link>
</div>


            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Clean formatting</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  We standardize your listing so it reads professionally and consistently.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Basic verification</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  We review links and details to avoid low quality or misleading listings.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Extra visibility</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Higher tiers receive better placement and additional promotion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="packages" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-slate-900">Listing packages</h2>
          <p className="text-slate-600">
            Payment is processed securely by Stripe. After payment, you will be redirected to the submission form.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PACKAGES.map((p) => (
            <div
              key={p.name}
              className="relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-slate-900">{p.name}</div>
                  <div className="mt-1 text-sm text-slate-600">{p.subtitle}</div>
                </div>
                <div className="rounded-xl bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
                  {p.price}
                </div>
              </div>

              <div className="mt-4 inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {p.badge}
              </div>

              <ul className="mt-5 space-y-3">
                {p.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-600" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex-1" />

              <a
                href={p.href}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Pay with Stripe
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>

              <div className="mt-3 text-xs text-slate-500">
                You will be redirected to the submission form after payment.
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-bold text-slate-900">Before you submit</h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="text-sm text-slate-700">
              Please ensure you have the source link, application link, eligibility, and deadline ready. Clear listings get approved faster.
            </div>
            <div className="text-sm text-slate-700">
              If you are listing a time sensitive opportunity, choose Standard or Premium for priority review and placement.
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-bold text-slate-900">FAQ</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="font-semibold text-slate-900">{f.q}</div>
                <div className="mt-2 text-sm text-slate-600">{f.a}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-slate-500">
          Need help before listing? Email us and include your organization name and opportunity title.
        </div>
      </section>
    </main>
  );
}
