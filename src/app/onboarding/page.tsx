"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, SignedIn, SignedOut } from '@clerk/nextjs';
import { TangoOnboarding } from '@/components/app/tango-onboarding';

function OnboardingPageContent() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = React.useState(true);

  React.useEffect(() => {
    if (isLoaded && user) {
      checkOnboardingStatus();
    }
  }, [isLoaded, user]);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/user/onboarding-status');
      if (response.ok) {
        const data = await response.json();
        
        if (data.hasCompletedOnboarding) {
          // User has completed onboarding, redirect to dashboard
          router.push(`/dashboard?niche=${data.primaryNiche || 'creator'}&section=crm`);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsCheckingOnboarding(false);
    }
  };

  const handleOnboardingComplete = (data: {
    roles: string[];
    goals: string[];
    setupTask?: string;
  }) => {
    // You can process the onboarding data here if needed
    console.log('Onboarding completed with data:', data);
    
    // Redirect to success page with progress animation
    const primaryNiche = data.roles[0] || 'creator';
    const niches = data.roles;
    
    router.push(`/onboarding/success?niche=${primaryNiche}&niches=${JSON.stringify(niches)}`);
  };

  // Show loading state while checking onboarding status
  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your onboarding status...</p>
        </div>
      </div>
    );
  }

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TangoOnboarding 
        userName={user?.firstName || "Creator"} 
        onComplete={handleOnboardingComplete} 
      />
              </div>
  );
}

function OnboardingPageWithRetry() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // If user is not signed in after loading, redirect to sign-up
      router.push('/signup');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign up to access the onboarding process.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up" className="bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600 transition-colors">
              Sign Up
            </Link>
            <Link href="/sign-in" className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors">
              Sign In
            </Link>
            <Link href="/" className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors">
              Back to Landing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <OnboardingPageContent />;
}

export default function OnboardingPage() {
  return <OnboardingPageWithRetry />;
}
