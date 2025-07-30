import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Twitter, Linkedin, Facebook, Instagram } from "lucide-react";

const TikTokIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export function FooterWithGrid() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="border-b border-slate-200 pb-8">
        </div>
        
        <div className="border-b border-slate-200 pb-8 pt-8">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 md:items-start">
            <div className="text-base font-medium max-w-xs">
              <div className="mb-1">
                <Link
                  href="/"
                  className="flex items-start"
                >
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1752032941301-0xul9i1n0y4r.png"
                    alt="Tango Logo"
                    width={175}
                    height={140}
                    className="object-contain"
                    style={{ marginTop: '-2px', height: 'auto' }}
                  />
                </Link>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                The modern CRM built specifically for the creator economy.
              </p>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="flex gap-12">
                <ul className="text-base font-medium">
                  <li className="mb-4 text-sm font-bold text-slate-800 leading-none">
                    Product
                  </li>
                  {PRODUCT_LINKS.map((item, idx) => (
                    <li key={"product" + idx} className="mb-4 text-sm font-normal">
                      <Link
                        href={item.href}
                        className="text-slate-500 hover:text-emerald-600 transition-colors"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                
                <ul className="text-base font-medium">
                  <li className="mb-4 text-sm font-bold text-slate-800 leading-none">
                    Company
                  </li>
                  {COMPANY_LINKS.map((item, idx) => (
                    <li key={"company" + idx} className="mb-4 text-sm font-normal">
                      <Link
                        href={item.href}
                        className="text-slate-500 hover:text-emerald-600 transition-colors"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>

                <ul className="text-base font-medium">
                  <li className="mb-4 text-sm font-bold text-slate-800 leading-none">
                    Resources
                  </li>
                  {GUIDE_LINKS.map((item, idx) => (
                    <li key={"resource" + idx} className="mb-4 text-sm font-normal">
                      <Link
                        href={item.href}
                        className="text-slate-500 hover:text-emerald-600 transition-colors"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>

                <ul className="text-base font-medium">
                  <li className="mb-4 text-sm font-bold text-slate-800 leading-none">
                    Platforms
                  </li>
                  {PLATFORM_LINKS.map((item, idx) => (
                    <li key={"platform" + idx} className="mb-4 text-sm font-normal">
                      <Link
                        href={item.href}
                        className="text-slate-500 hover:text-emerald-600 transition-colors"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>

                <ul className="text-base font-medium">
                  <li className="mb-4 text-sm font-bold text-slate-800 leading-none">
                    Legal
                  </li>
                  {LEGAL_LINKS.map((item, idx) => (
                    <li key={"legal" + idx} className="mb-4 text-sm font-normal">
                      <Link
                        href={item.href}
                        className="text-slate-500 hover:text-emerald-600 transition-colors"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <p className="mb-4 md:mb-0 text-sm text-slate-500">
            © 2025 Tango CRM. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="https://x.com/gotangocrm" className="text-slate-400 hover:text-emerald-600 transition-colors" target="_blank" rel="noopener noreferrer">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="https://www.instagram.com/tangocrm" className="text-slate-400 hover:text-emerald-600 transition-colors" target="_blank" rel="noopener noreferrer">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="https://www.tiktok.com/@tangocrm" className="text-slate-400 hover:text-emerald-600 transition-colors" target="_blank" rel="noopener noreferrer">
              <TikTokIcon />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const PRODUCT_LINKS = [
  { title: "Features", href: "#features" },
  { title: "Pricing", href: "#pricing" },
  { title: "Testimonials", href: "#testimonials" },
  { title: "FAQ", href: "#faq" },
];

const COMPANY_LINKS = [
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Terms of Service", href: "/terms" },
];

const GUIDE_LINKS = [
  { title: "Creator CRM Guide", href: "/blog/creator-crm-guide" },
  { title: "Podcaster CRM Guide", href: "/blog/podcaster-crm-guide" },
];

const PLATFORM_LINKS = [
  { title: "Creator CRM", href: "/creator-crm" },
  { title: "Podcaster CRM", href: "/podcaster-crm" },
  { title: "Coach CRM", href: "/coach-crm" },
  { title: "Freelancer CRM", href: "/freelancer-crm" },
];