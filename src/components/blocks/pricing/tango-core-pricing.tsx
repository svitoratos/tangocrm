"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Plus, Crown, Star, Zap, Users } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import PaymentService from '@/lib/payment-service';

interface NichePlan {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
}

const nichePlans: NichePlan[] = [
  {
    id: 'creator',
    name: 'Content Creator',
    icon: <Star className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    features: [
      'Content calendar & planning',
      'Brand collaboration tracking',
      'Social media management',
      'Audience analytics',
      'Revenue tracking',
      'Content performance metrics'
    ],
    monthlyPrice: 49.99,
    yearlyPrice: 479
  },
  {
    id: 'coach',
    name: 'Online Coach',
    icon: <Users className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    features: [
      'Client progress tracking',
      'Session scheduling',
      'Goal setting & monitoring',
      'Payment processing',
      'Client communication hub',
      'Performance reports'
    ],
    monthlyPrice: 49.99,
    yearlyPrice: 479,
    popular: true
  },
  {
    id: 'podcaster',
    name: 'Podcast Host',
    icon: <Zap className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    features: [
      'Guest management system',
      'Episode planning & tracking',
      'Sponsor relationship management',
      'Download analytics',
      'Revenue optimization',
      'Show notes automation'
    ],
    monthlyPrice: 49.99,
    yearlyPrice: 479
  },
  {
    id: 'freelancer',
    name: 'Freelancer/Consultant',
    icon: <Crown className="w-6 h-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    features: [
      'Project management',
      'Client onboarding',
      'Invoice & payment tracking',
      'Time tracking',
      'Proposal management',
      'Contract management'
    ],
    monthlyPrice: 49.99,
    yearlyPrice: 479
  }
];

export const TangoCorePricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedNiches, setSelectedNiches] = useState<string[]>(['coach']); // Default to most popular
  const { user } = useUser();

  const toggleNiche = (nicheId: string) => {
    setSelectedNiches(prev => 
      prev.includes(nicheId) 
        ? prev.filter(id => id !== nicheId)
        : [...prev, nicheId]
    );
  };

  const calculateTotal = () => {
    if (selectedNiches.length === 0) return { monthly: 0, yearly: 0 };
    
    const monthlyTotal = selectedNiches.reduce((total, nicheId) => {
      const niche = nichePlans.find(n => n.id === nicheId);
      return total + (niche ? niche.monthlyPrice : 0);
    }, 0);
    
    const yearlyTotal = selectedNiches.reduce((total, nicheId) => {
      const niche = nichePlans.find(n => n.id === nicheId);
      return total + (niche ? niche.yearlyPrice : 0);
    }, 0);
    
    return { monthly: monthlyTotal, yearly: yearlyTotal };
  };

  const totals = calculateTotal();
  const savings = (totals.monthly * 12) - totals.yearly;

  const handleGetStarted = async () => {
    if (!user) {
      window.location.href = '/sign-in?redirect_url=' + encodeURIComponent('/pricing');
      return;
    }

    const selectedNiche = selectedNiches[0] || 'coach';
    const billingCycle = isYearly ? 'yearly' : 'monthly';

    try {
      console.log('🔧 Creating checkout session for:', { selectedNiche, billingCycle, userId: user.id });

      // Use our centralized PaymentService instead of hardcoded links
      const result = await PaymentService.createCheckoutSessionWithFallbacks({
        niche: selectedNiche,
        billingCycle,
        isNicheUpgrade: false,
        userId: user.id
      });

      if (result.success && result.url) {
        console.log('✅ Redirecting to checkout session:', result.url);
        
        // Check if this was a fallback payment link (bypasses consolidation)
        if (result.error && result.error.includes('bypasses customer consolidation')) {
          console.warn('⚠️ Using fallback payment link - customer consolidation bypassed');
          // You could show a warning to the user here if desired
        }
        
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        console.error('❌ Failed to create checkout session:', result.error);
        
        // Show user-friendly error message
        alert(`Unable to process payment at this time. Please try again or contact support if the problem persists. Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      alert('An unexpected error occurred. Please try again or contact support.');
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Choose Your <span className="text-emerald-600">Tango CRM</span> Experience
          </h2>
          <p className="mt-6 text-xl text-slate-600">
            Select the niches that match your business. Start with one, add more anytime.
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center">
            <span className={`text-sm font-medium ${!isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative mx-3 inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-200">
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Niche Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {nichePlans.map((niche) => {
            const isSelected = selectedNiches.includes(niche.id);
            const price = isYearly ? niche.yearlyPrice : niche.monthlyPrice;
            
            return (
              <Card 
                key={niche.id} 
                className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? `ring-2 ring-emerald-500 shadow-lg ${niche.bgColor}` 
                    : 'hover:shadow-md border-slate-200'
                } ${niche.popular ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => toggleNiche(niche.id)}
              >
                {niche.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-12 h-12 ${niche.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <div className={niche.color}>
                      {niche.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    {niche.name}
                  </CardTitle>
                  <div className="text-3xl font-bold text-slate-900">
                    ${price}
                    <span className="text-base font-normal text-slate-500">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3">
                    {niche.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Selection Indicator */}
                  <div className="mt-6 flex items-center justify-center">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Card */}
        {selectedNiches.length > 0 && (
          <Card className="max-w-2xl mx-auto bg-white shadow-xl border border-emerald-200">
            <CardHeader className="text-center bg-emerald-50 rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-emerald-900">
                Your Tango CRM Plan
              </CardTitle>
              <CardDescription className="text-emerald-700">
                {selectedNiches.length} niche{selectedNiches.length > 1 ? 's' : ''} selected
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="space-y-4 mb-6">
                {selectedNiches.map(nicheId => {
                  const niche = nichePlans.find(n => n.id === nicheId);
                  if (!niche) return null;
                  
                  const price = isYearly ? niche.yearlyPrice : niche.monthlyPrice;
                  
                  return (
                    <div key={nicheId} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 ${niche.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                          <div className={`${niche.color} scale-75`}>
                            {niche.icon}
                          </div>
                        </div>
                        <span className="font-medium text-slate-900">{niche.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        ${price}/{isYearly ? 'year' : 'month'}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-semibold text-slate-900">Total:</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">
                      ${isYearly ? totals.yearly : totals.monthly}
                      <span className="text-lg font-normal text-slate-500">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    </div>
                    {isYearly && savings > 0 && (
                      <div className="text-sm text-emerald-600 font-medium">
                        Save ${savings}/year with yearly billing
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={handleGetStarted}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6 rounded-lg font-semibold"
                  size="lg"
                >
                  Get Started with Tango CRM
                </Button>
                
                <p className="text-center text-sm text-slate-500 mt-4">
                  30-day money-back guarantee • Cancel anytime • Add niches later
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Comparison */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-8">
            Every Plan Includes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Unlimited Contacts</h4>
              <p className="text-sm text-slate-600">Store unlimited client information</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Advanced Analytics</h4>
              <p className="text-sm text-slate-600">Deep insights into your business</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Mobile App</h4>
              <p className="text-sm text-slate-600">Manage on the go</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Priority Support</h4>
              <p className="text-sm text-slate-600">Get help when you need it</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};