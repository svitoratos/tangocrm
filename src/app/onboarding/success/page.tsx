"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PostSignupLoading } from '@/components/app/post-signup-loading';
import { useUser } from '@clerk/nextjs';

function OnboardingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Get session data from URL params
    const sessionId = searchParams.get('session_id');
    const niche = searchParams.get('niche') || 'creator';
    const niches = searchParams.get('niches') || JSON.stringify([niche]);

    console.log('🔧 Success page loaded with session:', sessionId);
    console.log('🔧 Niche:', niche);
    console.log('🔧 Niches:', niches);

    // Verify payment and update onboarding status
    const verifyPaymentAndUpdateStatus = async () => {
      try {
        if (sessionId) {
          // First, verify the payment was successful (only if we have a session ID)
          console.log('🔧 Verifying payment session:', sessionId);
          const verifyResponse = await fetch('/api/stripe/verify-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: sessionId
            }),
          });

          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            console.log('✅ Payment verified successfully:', verifyData);
          } else {
            console.error('❌ Payment verification failed');
            const errorData = await verifyResponse.json();
            console.error('❌ Verification error details:', errorData);
          }
        } else {
          console.log('🔧 No session ID - coming from payment link');
        }

        // Update onboarding status (fallback in case webhook hasn't processed yet)
        console.log('🔧 Updating onboarding status...');
        const response = await fetch('/api/user/onboarding-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            onboardingCompleted: true,
            primaryNiche: niche,
            niches: JSON.parse(niches)
          }),
        });

        if (!response.ok) {
          console.error('❌ Failed to update onboarding status');
          const errorData = await response.json();
          console.error('❌ Onboarding status error details:', errorData);
        } else {
          console.log('✅ Onboarding status updated successfully');
        }

        // Wait longer for database updates to propagate and ensure onboarding status is set
        console.log('🔧 Waiting for database updates to propagate...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Double-check payment status to ensure everything is properly set
        console.log('🔧 Double-checking payment status...');
        const paymentStatusResponse = await fetch('/api/user/payment-status');
        if (paymentStatusResponse.ok) {
          const paymentStatus = await paymentStatusResponse.json();
          console.log('🔧 Final payment status check:', paymentStatus);
          
          if (!paymentStatus.hasActiveSubscription) {
            console.warn('⚠️ User still doesn\'t have active subscription, this might indicate a webhook issue');
          }
          
          if (!paymentStatus.hasCompletedOnboarding) {
            console.warn('⚠️ User onboarding status not updated, retrying...');
            // Retry updating onboarding status
            const retryResponse = await fetch('/api/user/onboarding-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                onboardingCompleted: true,
                primaryNiche: niche,
                niches: JSON.parse(niches)
              }),
            });
            
            if (retryResponse.ok) {
              console.log('✅ Onboarding status updated on retry');
            } else {
              console.error('❌ Failed to update onboarding status on retry');
            }
          }
        }

      } catch (error) {
        console.error('❌ Error verifying payment and updating status:', error);
      }
    };

    // Simulate setup process with progress updates
    const setupSteps = [
      { name: 'Creating your CRM dashboard', duration: 2000 },
      { name: 'Personalizing your workspace', duration: 1500 },
      { name: 'Getting everything ready for you', duration: 1000 },
    ];

    let currentStep = 0;
    const totalDuration = setupSteps.reduce((sum, step) => sum + step.duration, 0);

    // Verify payment and update onboarding status immediately
    verifyPaymentAndUpdateStatus();

    const progressInterval = setInterval(() => {
      const elapsed = setupSteps
        .slice(0, currentStep)
        .reduce((sum, step) => sum + step.duration, 0);
      
      const currentStepElapsed = Date.now() - startTime - elapsed;
      
      if (currentStepElapsed >= setupSteps[currentStep]?.duration) {
        currentStep++;
      }

      const newProgress = Math.min(
        ((Date.now() - startTime) / totalDuration) * 100,
        100
      );
      
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressInterval);
        // Redirect to dashboard after setup is complete
        // Add extra delay to ensure database updates are processed
        setTimeout(async () => {
          console.log('🔧 Checking final status before redirecting to dashboard...');
          
          // Final check to ensure onboarding is completed
          try {
            const finalStatusResponse = await fetch('/api/user/payment-status');
            if (finalStatusResponse.ok) {
              const finalStatus = await finalStatusResponse.json();
              console.log('🔧 Final status check:', finalStatus);
              
              if (finalStatus.hasCompletedOnboarding) {
                console.log('✅ Onboarding completed, redirecting to dashboard...');
                router.push(`/dashboard?niche=${niche}&section=crm`);
              } else {
                console.warn('⚠️ Onboarding not completed, staying on success page');
                // Don't redirect, let the user see the success page
              }
            } else {
              console.error('❌ Failed to check final status, redirecting anyway...');
              router.push(`/dashboard?niche=${niche}&section=crm`);
            }
          } catch (error) {
            console.error('❌ Error checking final status:', error);
            router.push(`/dashboard?niche=${niche}&section=crm`);
          }
        }, 3000);
      }
    }, 100);

    const startTime = Date.now();

    // Cleanup interval on unmount
    return () => clearInterval(progressInterval);
  }, [router, searchParams, user]);

  return <PostSignupLoading />;
}

export default function OnboardingSuccessPage() {
  return (
    <Suspense fallback={<PostSignupLoading />}>
      <OnboardingSuccessContent />
    </Suspense>
  );
}
