"use client";

import React, { useEffect, useState } from 'react';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PaymentVerificationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireActiveSubscription?: boolean;
  requireOnboarding?: boolean;
}

export const PaymentVerification: React.FC<PaymentVerificationProps> = ({
  children,
  fallback,
  requireActiveSubscription = true,
  requireOnboarding = true,
}) => {
  const [isClient, setIsClient] = useState(false);
  
  const {
    hasCompletedOnboarding,
    hasActiveSubscription,
    subscriptionStatus,
    subscriptionTier,
    isLoading,
    error
  } = usePaymentStatus();
  
  const { isAdmin, isLoaded: isAdminLoaded } = useAdmin();
  const router = useRouter();

  // Ensure we only render on client side to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during SSR and initial client render
  if (!isClient || isLoading || !isAdminLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }



  // Admin users bypass all payment verification
  if (isAdmin) {
    console.log('Admin user detected - bypassing payment verification');
    return <>{children}</>;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
            <CardDescription>
              Unable to verify your subscription status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check onboarding requirement
  if (requireOnboarding && !hasCompletedOnboarding) {
    return fallback || (
      <div className="min-h-screen bg-stone-50 flex flex-col relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Green circles */}
          <div className="absolute top-20 left-10 w-4 h-4 bg-emerald-200 rounded-full opacity-60"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-emerald-300 rounded-full opacity-40"></div>
          <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-emerald-200 rounded-full opacity-50"></div>
          <div className="absolute bottom-20 right-1/3 w-5 h-5 bg-emerald-300 rounded-full opacity-30"></div>
          <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-emerald-200 rounded-full opacity-40"></div>
          
          {/* Orange circles */}
          <div className="absolute top-1/4 right-10 w-5 h-5 bg-orange-200 rounded-full opacity-50"></div>
          <div className="absolute bottom-40 left-10 w-4 h-4 bg-orange-300 rounded-full opacity-40"></div>
          <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-orange-200 rounded-full opacity-60"></div>
          <div className="absolute bottom-1/4 right-10 w-6 h-6 bg-orange-300 rounded-full opacity-30"></div>
          <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-orange-200 rounded-full opacity-50"></div>
        </div>
        
        {/* Header with Logo */}
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-center">
            <img 
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1752032941301-0xul9i1n0y4r.png" 
              alt="Tango Logo" 
              width={140} 
              height={112}
              className="object-contain cursor-pointer"
              style={{ height: 'auto' }}
            />
          </div>
        </div>
        
        {/* Main content */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md shadow-lg border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-800">
                <Lock className="h-6 w-6 text-amber-600" />
                Complete Onboarding
              </CardTitle>
              <CardDescription className="text-slate-600 text-base">
                You need to complete the onboarding process to access this feature
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Choose your creator niche</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Select your subscription plan</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Complete payment setup</span>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/onboarding')} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 text-base"
              >
                Start Onboarding
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check subscription requirement
  if (requireActiveSubscription && !hasActiveSubscription) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[200px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Subscription Required
            </CardTitle>
            <CardDescription>
              You need an active subscription to access this feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Status:</span>
                <Badge variant={subscriptionStatus === 'active' ? 'default' : 'destructive'}>
                  {subscriptionStatus}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Plan:</span>
                <Badge variant="outline">{subscriptionTier}</Badge>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/pricing')} 
                  className="w-full"
                >
                  View Plans
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard/settings')} 
                  className="w-full"
                >
                  Manage Subscription
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed, show children
  return <>{children}</>;
};

// Standalone component to show payment status
export const PaymentStatusDisplay: React.FC = () => {
  const {
    hasCompletedOnboarding,
    hasActiveSubscription,
    subscriptionStatus,
    subscriptionTier,
    primaryNiche,
    isLoading
  } = usePaymentStatus();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking status...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        <span className="text-gray-600">Status:</span>
        <Badge variant={hasActiveSubscription ? 'default' : 'destructive'}>
          {subscriptionStatus}
        </Badge>
      </div>
      {hasActiveSubscription && (
        <>
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-1">
            <span className="text-gray-600">Plan:</span>
            <Badge variant="outline">{subscriptionTier}</Badge>
          </div>
          {primaryNiche && (
            <>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Niche:</span>
                <Badge variant="secondary">{primaryNiche}</Badge>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}; 