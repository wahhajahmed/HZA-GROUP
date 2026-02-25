import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { FOOTER_LINKS, SITE_NAME } from '@/lib/constants';
import { BrandLogo } from '@/components/shared/BrandLogo';

const SOCIAL_LINKS = [
  {
    label: 'HZA Office Chairs',
    icon: Facebook,
    href: 'https://www.facebook.com/share/1DRNEZfLfP/',
    color: 'hover:text-blue-600',
  },
  {
    label: 'HZA Electronics',
    icon: Facebook,
    href: 'https://www.facebook.com/share/1ZZUAqakpW/',
    color: 'hover:text-blue-600',
  },
  {
    label: 'HZA Office Chairs',
    icon: Instagram,
    href: 'https://www.instagram.com/hzaoffice.chairs?igsh=MWU3Ynpzb3QxYnFvdw==',
    color: 'hover:text-pink-500',
  },
  {
    label: 'HZA Electronics',
    icon: Instagram,
    href: 'https://www.instagram.com/hza.electronics?igsh=Y3J3cDYweXk2MjQ=',
    color: 'hover:text-pink-500',
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <BrandLogo size="md" variant="light" href="/" />
            <p className="mt-3 max-w-xs text-sm text-gray-500 leading-relaxed">
              Your one-stop online store for quality products. Shop the latest
              collections with fast delivery across Pakistan.
            </p>
            {/* Social Links */}
            <div className="mt-5">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Follow Us</p>
              <div className="flex flex-col gap-2">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 text-sm text-gray-500 transition-colors ${s.color}`}
                  >
                    <s.icon className="h-4 w-4" />
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Policies
            </h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.policies.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Cash on Delivery &middot; Fast Shipping &middot; Easy Returns
          </p>
        </div>
      </div>
    </footer>
  );
}
