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
    const niche = searchParams.get('niche');
    const niches = searchParams.get('niches');
    const isUpgrade = searchParams.get('upgrade') === 'true';
    const specificNiche = searchParams.get('specific_niche');
    
    // Detect if this is a niche upgrade from hardcoded payment link
    // If we have a session ID but no specific niche params, it's likely a niche upgrade
    const isNicheUpgradeFromLink = sessionId && !niche && !niches;
    
    // Set default values for niche upgrade
    const finalNiche = niche || 'creator';
    const finalNiches = niches || JSON.stringify([finalNiche]);
    const finalIsUpgrade = isUpgrade || isNicheUpgradeFromLink;

    console.log('🔧 Success page loaded with session:', sessionId);
    console.log('🔧 Niche:', finalNiche);
    console.log('🔧 Niches:', finalNiches);
    console.log('🔧 Is upgrade:', finalIsUpgrade);

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
          
          // If this is a niche upgrade from hardcoded payment link, add the specific niche
          if (isNicheUpgradeFromLink) {
            console.log('🔧 Detected niche upgrade from payment link, adding specific niche...');
            try {
              const addNicheResponse = await fetch('/api/user/add-niche', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  nicheToAdd: finalNiche // Use the specific niche from URL params
                }),
              });
              
              if (addNicheResponse.ok) {
                console.log('✅ Successfully added specific niche from payment link:', finalNiche);
              } else {
                console.error('❌ Failed to add specific niche from payment link');
              }
            } catch (error) {
              console.error('❌ Error adding specific niche:', error);
            }
          }
          
          // Also check if user came from any payment link (even without session ID)
          // This handles cases where the payment link redirects to a different URL
          const referrer = document.referrer;
          const isFromStripePaymentLink = referrer.includes('stripe.com') || referrer.includes('buy.stripe.com');
          
          if (isFromStripePaymentLink) {
            console.log('🔧 Detected user came from Stripe payment link, but no specific niche was specified');
            console.log('⚠️ Cannot determine which niche to add - user should use the upgrade modal for specific niche selection');
            
            // Don't automatically add any niche - let the user choose through the upgrade modal
            // This prevents incorrect assumptions about which niche they want
          }
          
          // Handle specific niche upgrade from the upgrade modal
          if (specificNiche) {
            console.log('🔧 Adding specific niche from upgrade modal:', specificNiche);
            try {
              const addNicheResponse = await fetch('/api/user/add-niche', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  nicheToAdd: specificNiche
                }),
              });
              
              if (addNicheResponse.ok) {
                console.log('✅ Successfully added specific niche from upgrade modal:', specificNiche);
                
                // Special handling for coach niche - immediately switch to coach dashboard
                if (specificNiche === 'coach') {
                  console.log('🎯 Coach niche added - will redirect to coach dashboard');
                }
              } else {
                console.error('❌ Failed to add specific niche from upgrade modal');
              }
            } catch (error) {
              console.error('❌ Error adding specific niche from upgrade modal:', error);
            }
          }
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
            primaryNiche: finalNiche,
            niches: JSON.parse(finalNiches),
            isUpgrade: finalIsUpgrade
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
            
            // Directly update subscription status since webhook might not have processed yet
            console.log('🔧 Manually updating subscription status to active...');
            try {
              const subscriptionUpdateResponse = await fetch('/api/user/subscription-status', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  subscriptionStatus: 'active',
                  subscriptionTier: 'core'
                }),
              });
              
              if (subscriptionUpdateResponse.ok) {
                console.log('✅ Manually updated subscription status to active');
              } else {
                console.error('❌ Failed to manually update subscription status');
              }
            } catch (error) {
              console.error('❌ Error manually updating subscription status:', error);
            }
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
                primaryNiche: finalNiche,
                niches: JSON.parse(finalNiches),
                isUpgrade: finalIsUpgrade
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
      { name: 'Creating your CRM dashboard', duration: 1000 },
      { name: 'Personalizing your workspace', duration: 800 },
      { name: 'Getting everything ready for you', duration: 500 },
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
        // Reduced delay for faster redirect
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
                
                // Special handling for coach niche - redirect to coach dashboard
                if (finalNiche === 'coach' || specificNiche === 'coach') {
                  console.log('🎯 Redirecting to coach dashboard...');
                  router.push('/dashboard?niche=coach&section=dashboard&upgrade=success');
                } else if (finalNiche === 'creator' || specificNiche === 'creator') {
                  console.log('🎯 Redirecting to creator dashboard...');
                  router.push('/dashboard?niche=creator&section=dashboard&upgrade=success');
                } else if (finalNiche === 'podcaster' || specificNiche === 'podcaster') {
                  console.log('🎯 Redirecting to podcaster dashboard...');
                  router.push('/dashboard?niche=podcaster&section=dashboard&upgrade=success');
                } else if (finalNiche === 'freelancer' || specificNiche === 'freelancer') {
                  console.log('🎯 Redirecting to freelancer dashboard...');
                  router.push('/dashboard?niche=freelancer&section=dashboard&upgrade=success');
                } else {
                  router.push(`/dashboard?niche=${finalNiche}&section=crm`);
                }
              } else {
                console.warn('⚠️ Onboarding not completed, staying on success page');
                // Don't redirect, let the user see the success page
              }
            } else {
              console.error('❌ Failed to check final status, redirecting anyway...');
              if (finalNiche === 'coach' || specificNiche === 'coach') {
                router.push('/dashboard?niche=coach&section=dashboard&upgrade=success');
              } else if (finalNiche === 'creator' || specificNiche === 'creator') {
                router.push('/dashboard?niche=creator&section=dashboard&upgrade=success');
              } else if (finalNiche === 'podcaster' || specificNiche === 'podcaster') {
                router.push('/dashboard?niche=podcaster&section=dashboard&upgrade=success');
              } else if (finalNiche === 'freelancer' || specificNiche === 'freelancer') {
                router.push('/dashboard?niche=freelancer&section=dashboard&upgrade=success');
              } else {
                router.push(`/dashboard?niche=${finalNiche}&section=crm`);
              }
            }
          } catch (error) {
            console.error('❌ Error checking final status:', error);
            if (finalNiche === 'coach' || specificNiche === 'coach') {
              router.push('/dashboard?niche=coach&section=dashboard&upgrade=success');
            } else if (finalNiche === 'creator' || specificNiche === 'creator') {
              router.push('/dashboard?niche=creator&section=dashboard&upgrade=success');
            } else if (finalNiche === 'podcaster' || specificNiche === 'podcaster') {
              router.push('/dashboard?niche=podcaster&section=dashboard&upgrade=success');
            } else if (finalNiche === 'freelancer' || specificNiche === 'freelancer') {
              router.push('/dashboard?niche=freelancer&section=dashboard&upgrade=success');
            } else {
              router.push(`/dashboard?niche=${finalNiche}&section=crm`);
            }
          }
        }, 1500); // Reduced from 3000ms to 1500ms for faster redirect
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
