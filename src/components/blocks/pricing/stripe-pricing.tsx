"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { useStripe } from '@/hooks/use-stripe';
import { PRICING_TIERS } from '@/lib/stripe';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { SignUpButton } from '@clerk/nextjs';

export const StripePricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { createCheckoutSession, loading, error } = useStripe();

  const handleSubscribe = async (niche: string) => {
    // For demo purposes, using placeholder price IDs
    // In production, you'd use actual Stripe price IDs
    const priceId = `price_${niche}_${billingCycle}`;
    
    await createCheckoutSession(priceId, niche, billingCycle);
  };

  const getPrice = (niche: string) => {
    const tier = PRICING_TIERS[niche as keyof typeof PRICING_TIERS];
    return billingCycle === 'monthly' ? tier.monthly : tier.yearly;
  };

  const getSavings = (niche: string) => {
    const tier = PRICING_TIERS[niche as keyof typeof PRICING_TIERS];
    const monthlyTotal = tier.monthly * 12;
    const yearlyPrice = tier.yearly;
    return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
  };

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your creator business. Scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <Badge className="bg-emerald-500 text-white text-xs">
                Save up to 20%
              </Badge>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 mx-auto max-w-md">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-4">
          {Object.entries(PRICING_TIERS).map(([niche, tier]) => (
            <div 
              key={niche}
              className={`relative rounded-2xl p-8 ${
                niche === 'creator' 
                  ? 'ring-2 ring-emerald-500 bg-card shadow-xl' 
                  : 'bg-card border border-border shadow-lg'
              } transition-all duration-300 hover:shadow-xl`}
            >
              {niche === 'creator' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-emerald-500 text-white px-4 py-1 text-sm font-medium">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground">
                  {tier.name}
                </h3>
                
                <div className="mt-4 flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-foreground">
                    ${getPrice(niche)}
                  </span>
                  <span className="ml-1 text-lg font-medium text-muted-foreground">
                    /{billingCycle === 'monthly' ? 'mo' : 'year'}
                  </span>
                </div>

                {billingCycle === 'yearly' && (
                  <p className="mt-2 text-sm text-emerald-600 font-medium">
                    Save {getSavings(niche)}%
                  </p>
                )}
              </div>

              <div className="mt-8">
                <SignedIn>
                  <Button 
                    onClick={() => handleSubscribe(niche)}
                    disabled={loading}
                    className={`w-full py-3 px-6 text-base font-medium rounded-lg transition-all duration-200 ${
                      niche === 'creator'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Start ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Plan`
                    )}
                  </Button>
                </SignedIn>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button 
                      className={`w-full py-3 px-6 text-base font-medium rounded-lg transition-all duration-200 ${
                        niche === 'creator'
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl'
                          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      }`}
                    >
                      Sign Up to Start
                    </Button>
                  </SignUpButton>
                </SignedOut>
              </div>

              <div className="mt-8 space-y-4">
                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check 
                        className={`h-5 w-5 ${
                          niche === 'creator' ? 'text-emerald-500' : 'text-primary'
                        }`}
                      />
                    </div>
                    <p className="ml-3 text-sm text-muted-foreground leading-relaxed">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include no setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}; 