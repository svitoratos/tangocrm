import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Tango Core',
      price: billingCycle === 'monthly' ? '$39.99' : '$383.90',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      originalPrice: billingCycle === 'monthly' ? null : '$479.88',
      savings: billingCycle === 'monthly' ? null : 'Save $95.98',
      description: 'For creators, coaches, podcasters & freelancers',
      subtitle: 'Includes access to one niche workspace',
      features: [
        'Manage clients, content & projects',
        'Custom dashboards, pipelines & calendars',
        'Smart task reminders',
        'Niche-specific tools and workflows'
      ],
      buttonText: 'Start with Tango',
      isPrimary: true,
      isPopular: true
    },
    {
      name: 'Add a Niche',
      price: billingCycle === 'monthly' ? '$9.99' : '$95.90',
      period: billingCycle === 'monthly' ? '/month per niche' : '/year per niche',
      originalPrice: billingCycle === 'monthly' ? null : '$119.88',
      savings: billingCycle === 'monthly' ? null : 'Save $23.98',
      description: 'Expand Tango with more niche workspaces',
      subtitle: '(e.g. Podcasting + Coaching)',
      features: [
        'Unlock another creator mode',
        'Switch seamlessly between roles',
        'Dedicated pipelines & dashboards',
        'Keep content and clients organized by niche'
      ],
      buttonText: 'Add Another Niche',
      isPrimary: false,
      isPopular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Choose the plan that fits your creator business. Scale as you grow.
          </p>
          
          {/* Billing cycle toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors relative ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-6 xl:gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative rounded-2xl p-8 ${
                plan.isPrimary 
                  ? 'ring-2 ring-emerald-500 bg-white' 
                  : 'bg-white border border-slate-200'
              } transition-all duration-300`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-emerald-500 text-white px-4 py-1 text-sm font-medium">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-800">
                  {plan.name}
                </h3>
                
                <div className="mt-4 flex flex-col items-center">
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg line-through text-slate-400">
                        {plan.originalPrice}
                      </span>
                      <Badge className="bg-orange-100 text-orange-700 text-xs">
                        {plan.savings}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-slate-800">
                      {plan.price}
                    </span>
                    <span className="ml-1 text-lg font-medium text-slate-500">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-base text-slate-600">
                  {plan.description}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {plan.subtitle}
                </p>
              </div>

              <div className="mt-8">
                <Button 
                  onClick={() => {
                    if (plan.isPrimary) {
                      // Navigate to onboarding with billing cycle preference
                      window.location.href = `/onboarding?billing=${billingCycle}`;
                    } else {
                      // For niche upgrade, this would typically open a modal or go to dashboard
                      window.location.href = '/dashboard?section=upgrade';
                    }
                  }}
                  className={`w-full py-3 px-6 text-base font-medium rounded-lg transition-all duration-200 ${
                    plan.isPrimary
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </div>

              <div className="mt-8 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check 
                        className={`h-5 w-5 ${
                          plan.isPrimary ? 'text-emerald-500' : 'text-slate-500'
                        }`}
                      />
                    </div>
                    <p className="ml-3 text-sm text-slate-600 leading-relaxed">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  No setup fees • Cancel anytime
                </p>
                <p className="text-xs text-emerald-600 text-center mt-1">
                  ✅ 15-day satisfaction guarantee — full refund if you're not happy
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            All plans include no setup fees • Cancel anytime
          </p>
          <p className="text-sm text-emerald-600 font-medium mt-2">
            ✅ 15-day satisfaction guarantee — full refund if you're not happy
          </p>
          {billingCycle === 'yearly' && (
            <p className="text-sm text-emerald-600 font-medium mt-2">
              💰 Save 20% with yearly billing
            </p>
          )}
        </div>
      </div>
    </section>
  );
};