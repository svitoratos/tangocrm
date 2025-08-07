"use client";

import { PricingTable } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ClerkPricingTable = () => {
  const { isLoaded, isSignedIn } = useUser();

  // If user is not loaded yet, show loading state
  if (!isLoaded) {
    return (
      <section id="pricing" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-6 bg-slate-200 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If user is not signed in, show sign-in prompt
  if (!isSignedIn) {
    return (
      <section id="pricing" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Sign in to view available subscription plans and start your journey.
            </p>
            
            <Card className="mt-8 max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Sign In Required</CardTitle>
                <CardDescription>
                  Please sign in to access our pricing plans and subscription options.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => window.location.href = '/sign-in'}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Sign In to View Plans
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  // Show Clerk PricingTable for signed-in users
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg text-slate-600 mb-8">
            Select the perfect plan for your creator business. Upgrade or downgrade at any time.
          </p>
          
          {/* Clerk PricingTable Component */}
          <div className="mt-8">
            <PricingTable />
          </div>
        </div>
      </div>
    </section>
  );
};