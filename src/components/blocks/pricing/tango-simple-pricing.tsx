import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export const TangoSimplePricing = () => {
  const handleGetStarted = () => {
    // Redirect to external sign up
    window.location.href = 'https://accounts.gotangocrm.com/sign-up';
  };

  const handleAddNiche = () => {
    // Redirect to external sign in
    window.location.href = 'https://accounts.gotangocrm.com/sign-in';
  };

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-6 text-xl text-slate-600">
            Choose the plan that fits your creator business. Scale as you grow.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Plan 1 - Tango Core (Primary/Popular) */}
          <div className="relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-emerald-500 text-white px-4 py-1 text-sm font-medium shadow-lg">
                Most Popular
              </Badge>
            </div>
            
            <div className="relative rounded-2xl p-8 ring-2 ring-emerald-500 bg-white shadow-xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Tango Core
                </h3>
                
                <div className="mt-4 flex flex-col items-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-slate-800">
                      $39.99
                    </span>
                    <span className="ml-1 text-lg font-medium text-slate-500">
                      /month
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-base text-slate-600 font-medium">
                  For creators, coaches, podcasters & freelancers
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Includes access to one niche workspace
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">Manage clients, content & projects</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">Custom dashboards, pipelines & calendars</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">Smart task reminders</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">Niche-specific tools and workflows</span>
                </div>
              </div>

              <Button 
                onClick={handleGetStarted}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 text-lg"
              >
                Join Tango
              </Button>
            </div>
          </div>

          {/* Plan 2 - Add a Niche (Secondary) */}
          <div className="relative">
            <div className="rounded-2xl p-8 border border-slate-200 bg-white shadow-lg">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Add a Niche
                </h3>
                
                <div className="mt-4 flex flex-col items-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-slate-800">
                      $9.99
                    </span>
                    <span className="ml-1 text-lg font-medium text-slate-500">
                      /month per niche
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-base text-slate-600 font-medium">
                  Expand Tango with more niche workspaces
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  (e.g. Podcasting + Coaching)
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">Unlock another creator mode</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">Switch seamlessly between roles</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">Dedicated pipelines & dashboards</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-slate-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">Keep content and clients organized by niche</span>
                </div>
              </div>

              <Button 
                onClick={handleAddNiche}
                variant="outline"
                className="w-full mt-8 border-slate-300 text-slate-700 hover:bg-slate-50 py-3 text-lg font-semibold"
              >
                Add Another Niche
              </Button>
            </div>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">
            No setup fees • Cancel anytime
          </p>
          <div className="flex items-center justify-center text-emerald-600 font-medium">
            <Check className="h-5 w-5 mr-2" />
            14-day satisfaction guarantee — full refund if you're not happy
          </div>
        </div>
      </div>
    </section>
  );
};
