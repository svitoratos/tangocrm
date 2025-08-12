"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PostSignupLoading } from '@/components/app/post-signup-loading';
import { useUser } from '@clerk/nextjs';
import { usePaymentStatus } from '@/hooks/use-payment-status';

function OnboardingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const { forceRefreshAfterPayment, clearCache, refreshPaymentStatus } = usePaymentStatus();

  useEffect(() => {
    // Get session data from URL params
    const sessionId = searchParams.get('session_id');
    const niche = searchParams.get('niche');
    const niches = searchParams.get('niches');
    const isUpgrade = searchParams.get('upgrade') === 'true';
    const specificNiche = searchParams.get('specific_niche');
    const fromPayment = searchParams.get('from') === 'payment';
    
    // Check for pending niche upgrade from sessionStorage (set by sidebar upgrade flow)
    const pendingNicheUpgrade = sessionStorage.getItem('pendingNicheUpgrade');
    const needsPaymentProcessing = sessionStorage.getItem('needsPaymentProcessing') === 'true';
    
    // Detect if this is a niche upgrade from various sources
    const isNicheUpgradeFromLink = sessionId && !niche && !niches;
    const isNicheUpgradeFromSidebar = !sessionId && pendingNicheUpgrade;
    const isAnyUpgrade = isUpgrade || isNicheUpgradeFromLink || isNicheUpgradeFromSidebar;
    
    // Set default values for niche upgrade
    // Priority: URL params > sessionStorage > default
    const finalNiche = specificNiche || niche || pendingNicheUpgrade || 'creator';
    const finalNiches = niches || JSON.stringify([finalNiche]);
    const finalIsUpgrade = isAnyUpgrade;

    console.log('🔧 Success page loaded with session:', sessionId);
    console.log('🔧 From payment page:', fromPayment);
    console.log('🔧 Needs payment processing:', needsPaymentProcessing);
    console.log('🔧 Pending niche upgrade from sessionStorage:', pendingNicheUpgrade);
    console.log('🔧 Final niche:', finalNiche);
    console.log('🔧 Final niches:', finalNiches);
    console.log('🔧 Is upgrade:', finalIsUpgrade);
    console.log('🔧 Is niche upgrade from sidebar:', isNicheUpgradeFromSidebar);

    // Verify payment and update onboarding status
    const verifyPaymentAndUpdateStatus = async () => {
      try {
        // Handle background payment processing from payment-success page
        if (needsPaymentProcessing && fromPayment) {
          console.log('🔧 Handling background payment processing from payment-success page');
          
          const pendingOnboarding = sessionStorage.getItem('pendingOnboarding');
          if (pendingOnboarding) {
            try {
              const onboardingData = JSON.parse(pendingOnboarding);
              console.log('🔧 Processing legacy onboarding data in background:', onboardingData);
              
              // Call API to update user with onboarding data (legacy flow)
              const response = await fetch('/api/user/process-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ onboardingData }),
              });

              if (response.ok) {
                console.log('✅ Background payment processing successful');
                // Clear sessionStorage
                sessionStorage.removeItem('pendingOnboarding');
                sessionStorage.removeItem('needsPaymentProcessing');
              } else {
                const errorData = await response.json();
                console.error('❌ Background payment processing failed:', errorData);
              }
            } catch (error) {
              console.error('❌ Error in background payment processing:', error);
            }
          }
        }
        
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
          
          // Check if we have pending onboarding data from sessionStorage
          const pendingOnboarding = sessionStorage.getItem('pendingOnboarding');
          if (pendingOnboarding) {
            try {
              const onboardingData = JSON.parse(pendingOnboarding);
              console.log('🔧 Found pending onboarding data:', onboardingData);
              
              // Save onboarding data to the database
              const onboardingResponse = await fetch('/api/user/onboarding-status', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  onboardingCompleted: true,
                  primaryNiche: onboardingData.selectedRoles[0] || 'creator',
                  niches: onboardingData.selectedRoles,
                  goals: onboardingData.selectedGoals,
                  setupTask: onboardingData.selectedSetupTask,
                }),
              });
              
              if (onboardingResponse.ok) {
                console.log('✅ Successfully saved onboarding data from payment link');
                // Clear the pending onboarding data
                sessionStorage.removeItem('pendingOnboarding');
              } else {
                console.error('❌ Failed to save onboarding data from payment link');
              }
            } catch (error) {
              console.error('❌ Error processing pending onboarding data:', error);
            }
          }
          
          // Handle specific niche upgrade from the upgrade modal or payment links
          if (specificNiche) {
            console.log('🔧 Adding specific niche from upgrade modal or payment link:', specificNiche);
            
            // CRITICAL FIX: Only add niche if payment was actually completed
            // Check if we have a session ID or came from payment success
            const hasPaymentSession = sessionId || fromPayment;
            
            if (!hasPaymentSession) {
              console.warn('⚠️ Specific niche detected but no payment session found - skipping niche addition');
              console.warn('⚠️ This prevents adding niches without payment completion');
              
              // Don't add the niche - user needs to complete payment first
              return;
            }
            
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
                console.log('✅ Successfully added specific niche:', specificNiche);
                // Persist selection and refresh payment status cache
                localStorage.setItem('selectedNiche', specificNiche);
                clearCache();
                await forceRefreshAfterPayment();
              } else {
                console.error('❌ Failed to add specific niche');
                const errorData = await addNicheResponse.json();
                console.error('❌ Add niche error details:', errorData);
              }
            } catch (error) {
              console.error('❌ Error adding specific niche:', error);
            }
          } else if (isNicheUpgradeFromLink || isNicheUpgradeFromSidebar) {
            // If this is a niche upgrade from hardcoded payment link OR sidebar upgrade
            console.log('🔧 Detected niche upgrade, adding specific niche:', finalNiche);
            console.log('🔧 Upgrade source:', {
              fromLink: isNicheUpgradeFromLink,
              fromSidebar: isNicheUpgradeFromSidebar,
              pendingNicheUpgrade
            });
            
            // CRITICAL FIX: Only add niche if payment was actually completed
            // Check if we have a session ID or came from payment success
            const hasPaymentSession = sessionId || fromPayment;
            
            if (!hasPaymentSession) {
              console.warn('⚠️ Niche upgrade detected but no payment session found - skipping niche addition');
              console.warn('⚠️ This prevents adding niches without payment completion');
              
              // Clear the pending niche upgrade from sessionStorage to prevent future issues
              if (pendingNicheUpgrade) {
                sessionStorage.removeItem('pendingNicheUpgrade');
                console.log('🔧 Cleared pendingNicheUpgrade from sessionStorage (no payment)');
              }
              
              // Don't add the niche - user needs to complete payment first
              return;
            }
            
            try {
              const addNicheResponse = await fetch('/api/user/add-niche', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  nicheToAdd: finalNiche
                }),
              });
              
              if (addNicheResponse.ok) {
                console.log('✅ Successfully added specific niche:', finalNiche);
                // Persist selection and refresh payment status cache
                localStorage.setItem('selectedNiche', finalNiche);
                clearCache();
                await forceRefreshAfterPayment();
                
                // Clear the pending niche upgrade from sessionStorage
                if (pendingNicheUpgrade) {
                  sessionStorage.removeItem('pendingNicheUpgrade');
                  console.log('🔧 Cleared pendingNicheUpgrade from sessionStorage');
                }
              } else {
                console.error('❌ Failed to add specific niche');
                const errorData = await addNicheResponse.json();
                console.error('❌ Add niche error details:', errorData);
              }
            } catch (error) {
              console.error('❌ Error adding specific niche:', error);
            }
          } else {
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
          }
        }

        // Update onboarding status (fallback in case webhook hasn't processed yet)
        // Skip this for niche upgrades since the niche was already successfully added
        if (!finalIsUpgrade) {
          console.log('🔧 Updating onboarding status for new user...');
          const response = await fetch('/api/user/onboarding-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              onboardingCompleted: true,
              primaryNiche: finalNiche,
              niches: JSON.parse(finalNiches),
              isUpgrade: false
            }),
          });

          if (!response.ok) {
            console.error('❌ Failed to update onboarding status');
            const errorData = await response.json();
            console.error('❌ Onboarding status error details:', errorData);
          } else {
            console.log('✅ Onboarding status updated successfully');
          }
        } else {
          console.log('🔧 Skipping onboarding status update for niche upgrade (already handled by add-niche API)');
        }

        // Immediately refresh payment status so sidebar sees the new niche
        clearCache();
        await forceRefreshAfterPayment();
        
        // Additional fallback refresh after a short delay
        setTimeout(async () => {
          console.log('🔧 Performing additional refresh for better reliability...');
          clearCache();
          await refreshPaymentStatus(false);
        }, 1000);

        // Wait a bit for database updates to propagate and ensure onboarding status is set
        console.log('🔧 Waiting for database updates to propagate...');
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error('❌ Error verifying payment and updating status:', error);
      }
    };

    // Simulate setup process with progress updates
    // Faster progress since payment processing now happens in background
    const setupSteps = [
      { name: 'Creating your CRM dashboard', duration: 800 },
      { name: 'Personalizing your workspace', duration: 600 },
      { name: 'Getting everything ready for you', duration: 400 },
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
                
                // Persist chosen niche to localStorage so dashboard selects it
                const chosen = specificNiche || finalNiche;
                if (chosen) {
                  localStorage.setItem('selectedNiche', chosen);
                }
                
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
        }, 800); // Further reduced for better UX since payment processing is now in background
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
