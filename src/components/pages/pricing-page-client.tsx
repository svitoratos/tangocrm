"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { PaymentVerification } from '@/components/app/payment-verification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Users, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { TangoHeader } from '@/components/app/tango-header';
import { FooterWithGrid } from '@/components/blocks/footers/footer-with-grid';

const pricingPlans = [
  {
    name: 'Tango Core',
    description: 'Perfect for creators, coaches, podcasters & freelancers',
    price: {
      monthly: 39.99,
      yearly: 383.90 // 20% discount
    },
    features: [
      'Unlimited clients & opportunities',
      'Content planning & scheduling',
      'Goal tracking & analytics',
      'Calendar integration',
      'Journal & reflection tools',
      'Email support',
      'Mobile responsive dashboard'
    ],
    popular: true,
    cta: 'Join Tango',
    color: 'emerald'
  },
  {
    name: 'Add a Niche',
    description: 'Expand your workspace with additional creator niches',
    price: {
      monthly: 9.99,
      yearly: 95.90 // 20% discount
    },
    features: [
      'Additional niche workspace',
      'Niche-specific templates',
      'Cross-niche analytics',
      'Unified dashboard view',
      'Priority support',
      'Advanced integrations'
    ],
    popular: false,
    cta: 'Add Niche',
    color: 'blue',
    note: 'Requires Tango Core plan'
  }
];

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
            Choose Your Creator CRM Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful tools designed specifically for creators, coaches, podcasters, and freelancers
          </p>
          
          {requirePayment && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
              <p className="text-amber-800 text-sm">
                <strong>Subscription Required:</strong> You need an active subscription to access the dashboard features.
              </p>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'ring-2 ring-emerald-500 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-emerald-500 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">
                    ${plan.price.monthly}
                  </div>
                  <div className="text-gray-600">per month</div>
                  <div className="text-sm text-gray-500 mt-1">
                    ${plan.price.yearly} billed yearly (save 20%)
                  </div>
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.note && (
                  <div className="text-sm text-gray-500 text-center p-3 bg-gray-50 rounded-lg">
                    {plan.note}
                  </div>
                )}
                
                <Link href="/sign-up">
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

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
              Simply sign up and start using Tango CRM immediately. No credit card required to get started.
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
                  We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your payment in full.
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