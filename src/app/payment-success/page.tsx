"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    console.log('🔧 Payment success page loaded - immediately redirecting for better UX');
    
    // Store legacy payment processing data for background processing
    const pendingOnboarding = sessionStorage.getItem('pendingOnboarding');
    if (pendingOnboarding) {
      console.log('🔧 Found pending onboarding data, flagging for background processing');
      sessionStorage.setItem('needsPaymentProcessing', 'true');
      
      // Persist chosen niche so sidebar uses it right away
      try {
        const onboardingData = JSON.parse(pendingOnboarding);
        const chosen = onboardingData.selectedRoles?.[0] || 'creator';
        if (chosen) {
          localStorage.setItem('selectedNiche', chosen);
        }
      } catch (error) {
        console.error('❌ Error parsing onboarding data:', error);
      }
    }
    
    // Immediately redirect to onboarding success for better UX
    // The onboarding success page will handle all processing in the background
    console.log('🔧 Immediately redirecting to onboarding success for better UX');
    router.replace('/onboarding/success?from=payment');
    
  }, [router]);

  // Show a minimal loading state during the immediate redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-muted-foreground">Redirecting...</span>
      </div>
    </div>
  );
} 