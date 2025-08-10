"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { PaymentVerification } from '@/components/app/payment-verification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TangoHeader } from '@/components/app/tango-header';
import { FooterWithGrid } from '@/components/blocks/footers/footer-with-grid';
import { TangoCorePricing } from '@/components/blocks/pricing/tango-core-pricing';


// Component that uses useSearchParams - must be wrapped in Suspense
function PricingContent() {
  const searchParams = useSearchParams();
  const requirePayment = searchParams.get('require_payment') === 'true';
  const { hasActiveSubscription, hasCompletedOnboarding } = usePaymentStatus();

  // If user has active subscription, redirect to dashboard
  useEffect(() => {
    if (hasActiveSubscription && hasCompletedOnboarding) {
      window.location.href = '/dashboard';
    }
  }, [hasActiveSubscription, hasCompletedOnboarding]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TangoHeader />
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Build Your Perfect CRM
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the niches that match your business. Start with one, scale as you grow.
          </p>
          
          {requirePayment && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
              <p className="text-amber-800 text-sm">
                <strong>Subscription Required:</strong> You need an active subscription to access the dashboard features.
              </p>
            </div>
          )}
        </div>

        {/* Tango Core Pricing */}
        <TangoCorePricing />

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                            <CardTitle className="text-lg">How do I get started?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Simply sign up, choose your niche, and start using Tango CRM right away.
            </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Absolutely. You can cancel your subscription at any time with no penalties or hidden fees.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through Stripe.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We offer a 14-day satisfaction guarantee — full refund if you're not happy. This applies to both monthly and annual subscriptions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <FooterWithGrid />
    </div>
  );
}

export default function PricingPageClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
} 