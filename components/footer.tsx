import Link from 'next/link';
import { ExternalLink, Mail, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-[linear-gradient(165deg,#020617_0%,#0f172a_55%,#083344_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="flex flex-col items-start">
            <img
              src="https://growthforum.my/wp-content/uploads/2025/04/GROWTH-FORUM-Logo-Latest-no-bg-white-text-1.png"
              alt="Growth Forum"
              className="mb-4 h-16 w-auto"
            />
            <p className="max-w-sm leading-relaxed text-slate-300">
              A premium platform connecting serious applicants to grants, fellowships, scholarships, and career growth pathways.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Platform</h3>
            <div className="flex flex-col space-y-3">
              <Link href="/opportunities" className="group flex items-center gap-2 text-slate-300 transition-colors hover:text-white">
                <span>Browse Opportunities</span>
                <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <Link href="/ai-match" className="flex items-center gap-2 text-slate-300 transition-colors hover:text-white">
                <Sparkles className="h-4 w-4" />
                <span>AI Match Intake</span>
              </Link>
              <a href="https://growthforum.my/about-us/" className="text-slate-300 transition-colors hover:text-white">
                About Us
              </a>
              <a href="https://growthforum.my/contact/" className="text-slate-300 transition-colors hover:text-white">
                Contact Us
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Stay Updated</h3>
            <p className="mb-4 text-slate-300">
              Receive newly listed opportunities and tailored updates directly by email.
            </p>
            <a
              href="https://growthforum.my/newsletter/"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-cyan-500"
            >
              <Mail className="h-4 w-4" />
              Subscribe Now
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-700/70 pt-8 md:flex-row">
          <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} Growth Forum. All rights reserved.</p>
          <p className="text-sm text-slate-400">Built for high-intent opportunity discovery</p>
        </div>
      </div>
    </footer>
  );
}
