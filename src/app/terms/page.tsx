"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Users, Database, Globe, Mail, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import Link from 'next/link';
import { FooterWithGrid } from '@/components/blocks/footers/footer-with-grid';

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tango CRM Terms of Service</h1>
          <p className="text-gray-600 mb-2">
            Effective Date: {lastUpdated}
          </p>
          <p className="text-gray-600">
            Welcome to Tango CRM ("Tango", "we", "us", or "our"). These Terms of Service ("Terms") govern your use of the Tango CRM platform, including our website, dashboard, mobile applications, and related services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
          </p>
          <p className="text-gray-600 mt-2">
            If you do not agree to these Terms, do not use the Service.
          </p>
        </div>

        <div className="space-y-6">
          {/* Who We Serve */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                1. Who We Serve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Tango CRM is designed for creators, podcasters, freelancers, and coaches looking to manage pipelines, content, clients, and brand deals in one place.
              </p>
              <p className="text-gray-600">
                By using the Service, you represent that you are at least 18 years old and have the legal authority to enter into these Terms.
              </p>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                2. User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                You must create an account to access most features. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Provide accurate and complete information.</li>
                <li>Keep your login credentials secure.</li>
                <li>Notify us immediately of any unauthorized use of your account.</li>
              </ul>
              <p className="text-gray-600">
                You are responsible for all activity that occurs under your account.
              </p>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                3. Acceptable Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 mb-2">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Violate any law or regulation.</li>
                <li>Upload or distribute viruses or malicious code.</li>
                <li>Infringe the intellectual property rights of others.</li>
                <li>Harass, abuse, or harm other users.</li>
                <li>Attempt to gain unauthorized access to other users' accounts or data.</li>
              </ul>
              <p className="text-gray-600">
                We reserve the right to suspend or terminate your account for violations of this section.
              </p>
            </CardContent>
          </Card>

          {/* Subscription Terms and Billing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" />
                4. Subscription Terms and Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Subscription Plans</h3>
                <p className="text-gray-600 mb-2">
                  Tango CRM offers multiple subscription tiers with different feature sets and usage limits. Current plans and pricing are available at <a href="https://gotangocrm.com/pricing" className="text-blue-600 hover:underline">gotangocrm.com/pricing</a>. We reserve the right to modify pricing with <strong>60 days' advance notice</strong> for existing customers.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Billing and Payment</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Subscription fees are billed <strong>in advance</strong> for each billing period (monthly or annual).</li>
                  <li>Subscriptions <strong>automatically renew</strong> unless cancelled before the renewal date.</li>
                  <li>Accepted payment methods: <strong>major credit cards</strong>.</li>
                  <li>All prices are listed in <strong>USD</strong> (additional currencies available for enterprise customers).</li>
                  <li>You are responsible for <strong>applicable taxes, VAT, and duties</strong> in your jurisdiction.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Money-Back Guarantee</h3>
                <p className="text-gray-600">
                  All subscribers are eligible for a <strong>15-day satisfaction guarantee</strong> — full refund if you're not happy. This applies to both monthly and annual subscriptions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Late Payments and Service Suspension</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Accounts may be <strong>suspended after 3 days</strong> of non-payment.</li>
                  <li>Service resumes <strong>immediately</strong> upon successful payment.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Cancellation</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>You may cancel your subscription at any time through your account dashboard.</li>
                  <li>Cancellation is effective at the end of your current billing period.</li>
                  <li>You retain access to all features through the end of your paid term.</li>
                  <li>No refunds are provided for partial billing periods <strong>except as specified in our money-back guarantee or required by law</strong>.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                5. Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                All content, trademarks, and code on the Service are owned by Tango CRM or its licensors.
              </p>
              <p className="text-gray-600">
                You may not copy, modify, distribute, sell, or lease any part of our Service without our prior written consent.
              </p>
              <p className="text-gray-600">
                You retain ownership of content you upload to the platform but grant us a non-exclusive license to use it solely to operate and improve the Service.
              </p>
            </CardContent>
          </Card>

          {/* Data and Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                6. Data and Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your privacy is important to us. Please review our <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> to understand how we collect, use, and protect your information.
              </p>
              <p className="text-gray-600">
                We do not sell your personal data.
              </p>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                7. Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                The Service may integrate with third-party platforms (e.g., Instagram, Google, TikTok). We are not responsible for the content, availability, or performance of these services.
              </p>
              <p className="text-gray-600">
                Use of third-party services is subject to their own terms and policies.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                8. Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>The Service will be uninterrupted or error-free.</li>
                <li>The accuracy or reliability of any information obtained through the Service.</li>
              </ul>
              <p className="text-gray-600">
                You use the Service at your own risk.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                9. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                To the maximum extent permitted by law, Tango CRM shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Indirect, incidental, or consequential damages.</li>
                <li>Loss of profits, revenue, or data.</li>
                <li>Any damages exceeding the amount you paid us in the past 12 months.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-gray-600" />
                10. Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                You may stop using the Service at any time.
              </p>
              <p className="text-gray-600">
                We may suspend or terminate your access if you violate these Terms or use the Service in a way that could cause harm.
              </p>
            </CardContent>
          </Card>

          {/* Modifications to the Terms */}
          <Card>
            <CardHeader>
              <CardTitle>11. Modifications to the Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We may update these Terms from time to time. If we make material changes, we will notify you via email or within the Service.
              </p>
              <p className="text-gray-600">
                Continued use of the Service after changes means you accept the updated Terms.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>12. Governing Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                These Terms are governed by the laws of the State of New York, without regard to conflict of law principles.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-600" />
                13. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                If you have questions about these Terms, please contact us at:
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