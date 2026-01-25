import Link from 'next/link';
import { Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="flex flex-col items-start">
            <img
              src="https://growthforum.my/wp-content/uploads/2025/04/GROWTH-FORUM-Logo-Latest-no-bg-white-text-1.png"
              alt="Growth Forum"
              className="h-16 w-auto mb-4"
            />
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Connecting ambitious individuals with opportunities to accelerate their personal and professional growth.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <div className="flex flex-col space-y-3">
              <Link
                href="/opportunities"
                className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <span>Browse Opportunities</span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <a
                href="https://growthforum.my/newsletter/"
                className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <Mail className="w-4 h-4" />
                <span>Newsletter</span>
              </a>
              <a
                href="https://growthforum.my/about-us/"
                className="text-slate-300 hover:text-white transition-colors"
              >
                About Us
              </a>
              <a
                href="https://growthforum.my/contact/"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Stay Updated</h3>
            <p className="text-slate-400 mb-4">
              Get weekly updates on new opportunities delivered straight to your inbox.
            </p>
            <a
              href="https://growthforum.my/newsletter/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all hover:shadow-lg"
            >
              Subscribe Now
            </a>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Growth Forum. All rights reserved.
          </p>
          <p className="text-slate-500 text-sm">
            Made with care for ambitious individuals
          </p>
        </div>
      </div>
    </footer>
  );
}