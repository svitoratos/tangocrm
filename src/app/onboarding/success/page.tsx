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

    if (!sessionId) {
      // If no session ID, redirect to onboarding
      router.push('/onboarding');
      return;
    }

    // Update onboarding status
    const updateOnboardingStatus = async () => {
      try {
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
          console.error('Failed to update onboarding status');
        }
      } catch (error) {
        console.error('Error updating onboarding status:', error);
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

    // Update onboarding status immediately
    updateOnboardingStatus();

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
        setTimeout(() => {
          router.push(`/dashboard?niche=${niche}&section=crm`);
        }, 1000);
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
