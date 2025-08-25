import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export const TangoSimplePricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const handleGetStarted = () => {
    // Redirect to external sign up
    window.location.href = 'https://accounts.gotangocrm.com/sign-up';
  };

  const monthlyPrice = 49.99;
  const yearlyPrice = 479.00;
  const savings = (monthlyPrice * 12) - yearlyPrice;

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-6 text-xl text-slate-600">
            One plan. All niches. Everything you need to grow your creator business.
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
                Save ${savings.toFixed(0)}
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Grid - Single Plan */}
        <div className="max-w-2xl mx-auto">
          
          {/* Tango Core Plan */}
          <div className="relative flex flex-col h-full">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-emerald-500 text-white px-4 py-1 text-sm font-medium shadow-lg">
                Most Popular
              </Badge>
            </div>
            
            <div className="relative rounded-2xl p-8 ring-2 ring-emerald-500 bg-white shadow-xl flex flex-col h-full">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Tango Core
                </h3>
                
                <div className="mt-4 flex flex-col items-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-slate-800">
                      ${isYearly ? yearlyPrice.toFixed(0) : monthlyPrice.toFixed(2)}
                    </span>
                    <span className="ml-1 text-lg font-medium text-slate-500">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>
                  {isYearly && (
                    <p className="mt-2 text-sm text-slate-500">
                      ${(yearlyPrice / 12).toFixed(2)}/month when billed annually
                    </p>
                  )}
                </div>

                <p className="mt-4 text-base text-slate-600 font-medium">
                  Access to all niche workspaces
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Creator, Coach, Podcaster & Freelancer
                </p>
              </div>

              <div className="mt-8 space-y-4 flex-grow">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">Access to all 4 niche workspaces</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">Unlimited clients & opportunities</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">Advanced analytics & reporting</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">Content calendar & task management</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">Progress monitoring</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">Email support & priority assistance</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">14-day money-back guarantee</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button 
                  onClick={handleGetStarted}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Get Started with Tango Core
                </Button>
                <p className="text-xs text-slate-500 text-center mt-3">
                  No setup fees • Cancel anytime • 14-day money back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
