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
    cta: 'Start 3-Day Free Trial',
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
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price.monthly}
                    </span>
                    <span className="text-gray-600 ml-1">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    or ${plan.price.yearly}/year (save 20%)
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.note && (
                  <p className="text-sm text-gray-500 italic">{plan.note}</p>
                )}
                
                <div className="pt-4">
                  {plan.name === 'Tango Core' ? (
                    <Link href="/onboarding">
                      <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                        {plan.cta}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/dashboard/settings">
                      <Button variant="outline" className="w-full">
                        {plan.cta}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Scale Your Creator Business
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Client Management</h3>
              <p className="text-gray-600">
                Track leads, manage relationships, and close more deals with our comprehensive CRM tools.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Goal Tracking</h3>
              <p className="text-gray-600">
                Set and track your business goals with detailed analytics and progress monitoring.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Insights</h3>
              <p className="text-gray-600">
                Get deep insights into your business performance with real-time analytics and reporting.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Questions?
          </h2>
          <p className="text-gray-600 mb-6">
            We're here to help you succeed
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/contact">
              <Button variant="outline">Contact Support</Button>
            </Link>
            <Link href="/onboarding">
              <Button>Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we prepare your pricing information.</p>
        </div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
} 