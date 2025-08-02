"use client";

import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Eye, Users, Database, Globe, Mail, Phone, Calendar, Cookie, Baby, AlertTriangle } from 'lucide-react';
import { IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import Link from 'next/link';
import { FooterWithGrid } from '@/components/blocks/footers/footer-with-grid';

export const metadata: Metadata = generateMetadata({
  title: 'Privacy Policy - Tango CRM Data Protection & Privacy',
  description: 'Learn how Tango CRM protects your data and privacy. Our comprehensive privacy policy explains how we collect, use, and safeguard your information in our creator CRM platform.',
  keywords: [
    'Tango CRM privacy policy',
    'creator CRM data protection',
    'CRM platform privacy',
    'data security creator tools',
    'GDPR compliance CRM',
    'creator business privacy',
    'Tango CRM data protection'
  ],
  image: '/privacy-og-image.jpg'
})

export default function PrivacyPolicy() {
  const lastUpdated = "January 15, 2024";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with same navbar as landing page */}
      <div className="bg-white border-b">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tango CRM Privacy Policy</h1>
          <p className="text-gray-600 mb-2">
            Effective Date: {lastUpdated}
          </p>
          <p className="text-gray-600 mb-2">
            Last Updated: {lastUpdated}
          </p>
          <p className="text-gray-600">
            Tango CRM ("Tango", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our website, application, and related services (collectively, the "Service").
          </p>
          <p className="text-gray-600 mt-2">
            By using the Service, you agree to the terms of this Privacy Policy. If you do not agree, please do not use the Service.
          </p>
        </div>

        <div className="space-y-6">
          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 mb-4">We collect the following categories of information:</p>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1.1 Information You Provide to Us</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Name, email, and password when you sign up</li>
                  <li>Business details (e.g., niche, company name, brand deals)</li>
                  <li>Payment information (processed securely by third-party processors)</li>
                  <li>Messages, project notes, and content stored in your CRM workspace</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1.2 Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Device data (IP address, browser type, OS)</li>
                  <li>Usage data (pages viewed, session time, clicks)</li>
                  <li>Cookies and tracking pixels</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1.3 Third-Party Integrations</h3>
                <p className="text-gray-600">
                  When you connect social media or third-party platforms (e.g., Instagram, Google), we may access limited information with your permission, such as username, email, or post metrics.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                2. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">We use your information to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Provide and improve the Service</li>
                <li>Personalize your user experience</li>
                <li>Process payments and manage subscriptions</li>
                <li>Communicate with you (transactional and marketing emails)</li>
                <li>Respond to support inquiries</li>
                <li>Analyze trends and platform usage</li>
                <li>Enforce Terms of Service and prevent abuse</li>
              </ul>
            </CardContent>
          </Card>

          {/* Sharing Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                3. Sharing Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>We do not sell your personal data.</strong>
                </p>
              </div>
              
              <p className="text-gray-600 mb-2">We may share your information with:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li><strong>Service providers</strong> (e.g., payment processors, analytics tools)</li>
                <li><strong>Third-party integrations</strong> you explicitly authorize</li>
                <li><strong>Legal authorities</strong> if required by law or to protect our rights</li>
                <li><strong>Business transfers</strong>, if Tango CRM is involved in a merger, acquisition, or sale of assets</li>
              </ul>
              <p className="text-gray-600">
                All partners and vendors are contractually obligated to protect your information.
              </p>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5 text-orange-600" />
                4. Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Keep you logged in</li>
                <li>Remember preferences</li>
                <li>Analyze site traffic</li>
                <li>Deliver relevant marketing</li>
              </ul>
              <p className="text-gray-600 mt-4">
                You can control cookie preferences through your browser settings.
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                5. Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">We retain your information for as long as necessary to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Provide the Service</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p className="text-gray-600 mt-4">
                You may delete your account at any time, which will remove your data from active systems.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                6. Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Depending on your location, you may have rights under data protection laws such as the <strong>GDPR</strong> or <strong>CCPA</strong>, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Right to access your data</li>
                <li>Right to correct or update your data</li>
                <li>Right to request deletion</li>
                <li>Right to object to or limit processing</li>
                <li>Right to data portability</li>
                <li>Right to withdraw consent at any time</li>
              </ul>
              <p className="text-gray-600 mt-4">
                To exercise these rights, contact us at <a href="mailto:hello@gotangocrm.com" className="text-blue-600 hover:underline">hello@gotangocrm.com</a>.
              </p>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                7. Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">We implement industry-standard security measures to protect your data, including:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Encrypted connections (HTTPS)</li>
                <li>Secure storage</li>
                <li>Role-based access controls</li>
                <li>Routine backups</li>
              </ul>
              <p className="text-gray-600 mt-4">
                However, no system is 100% secure. Please use strong passwords and keep your login credentials confidential.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-blue-600" />
                8. Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Tango CRM is not intended for individuals under 18. We do not knowingly collect data from children. If we discover a child has provided personal data, we will delete it promptly.
              </p>
            </CardContent>
          </Card>

          {/* International Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                9. International Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Tango CRM is based in the United States. By using the Service, you consent to the transfer of your information to the U.S. or other jurisdictions where we or our service providers operate.
              </p>
            </CardContent>
          </Card>

          {/* Changes to This Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                10. Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We may update this Privacy Policy from time to time. Material changes will be communicated via email or in-app notice. Continued use of the Service after changes constitutes your acceptance.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-600" />
                11. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                For questions or concerns about this policy, or to exercise your data rights, contact:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  📧 <a href="mailto:hello@gotangocrm.com" className="font-medium hover:underline">hello@gotangocrm.com</a>
                </p>
                <p className="text-blue-800 mt-2">
                  📍 167 Madison Avenue<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;Ste 205 #485<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;New York City, NY 10016<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;United States
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <FooterWithGrid />
    </div>
  );
}

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const navItems = [
    { name: "Features", link: "/#features" },
    { name: "Pricing", link: "/#pricing" },
    { name: "About", link: "/about" },
    { name: "Testimonials", link: "/#testimonials" },
    { name: "FAQ", link: "/#faq" },
    { name: "Contact", link: "/contact" }
  ];

  return (
    <div className="w-full">
      <DesktopNav navItems={navItems} hovered={hovered} setHovered={setHovered} />
      <MobileNav navItems={navItems} open={open} setOpen={setOpen} />
    </div>
  );
};

const DesktopNav = ({ navItems, hovered, setHovered }: any) => {
  return (
    <motion.div
      onMouseLeave={() => {
        setHovered(null);
      }}
      className="relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start px-6 py-6 lg:flex"
    >
      <Logo />
      <div className="hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-muted-foreground lg:flex lg:space-x-2">
        {navItems.map((navItem: any, idx: number) => (
          <Link
            onMouseEnter={() => setHovered(idx)}
            className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            key={`link=${idx}`}
            href={navItem.link}
          >
            {hovered === idx && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-muted"
              />
            )}
            <span className="relative z-20">{navItem.name}</span>
          </Link>
        ))}
      </div>
      <div className="flex items-center space-x-4">
        <Link 
          href="/sign-in"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          Sign In
        </Link>
        <Link 
          href="/sign-up"
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors duration-200"
        >
          Sign Up
        </Link>
      </div>
    </motion.div>
  );
};

const MobileNav = ({ navItems, open, setOpen }: any) => {
  return (
    <>
      <motion.div
        animate={{ borderRadius: open ? "0px" : "0px" }}
        key={String(open)}
        className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-between px-6 py-6 lg:hidden"
      >
        <div className="flex w-full flex-row items-center justify-between">
          <Logo />
          {open ? (
            <IconX
              className="text-foreground hover:text-muted-foreground cursor-pointer"
              onClick={() => setOpen(!open)}
            />
          ) : (
            <IconMenu2
              className="text-foreground hover:text-muted-foreground cursor-pointer"
              onClick={() => setOpen(!open)}
            />
          )}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute inset-x-0 top-20 z-20 flex w-full flex-col items-center justify-start gap-6 bg-background border-t border-border px-6 py-8 shadow-lg"
            >
              {navItems.map((navItem: any, idx: number) => (
                <Link
                  key={`link=${idx}`}
                  href={navItem.link}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-200"
                  onClick={() => setOpen(false)}
                >
                  {navItem.name}
                </Link>
              ))}
              <div className="flex flex-col items-center gap-4 w-full max-w-xs mt-4">
                <Link 
                  href="/sign-in"
                  className="w-full text-center py-2 text-muted-foreground hover:text-foreground font-medium transition-colors duration-200"
                  onClick={() => setOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up"
                  className="w-full text-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors duration-200"
                  onClick={() => setOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2"
    >
      <img 
        src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1752032941301-0xul9i1n0y4r.png" 
        alt="Tango Logo" 
        width={140} 
        height={112}
        className="object-contain"
        style={{ height: 'auto' }}
      />
    </Link>
  );
}; 