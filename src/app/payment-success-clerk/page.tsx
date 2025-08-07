"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClerkPaymentSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const completeOnboarding = async () => {
      try {
        console.log('🔧 Clerk payment success - completing onboarding');
        
        // Get onboarding data from sessionStorage
        const onboardingData = sessionStorage.getItem('pendingOnboarding');
        
        if (onboardingData) {
          const data = JSON.parse(onboardingData);
          console.log('📋 Onboarding data:', data);
          
          // Save onboarding data to database
          const response = await fetch('/api/user/onboarding-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              onboardingCompleted: true,
              primaryNiche: data.selectedRoles[0] || 'creator',
              niches: data.selectedRoles,
              goals: data.selectedGoals,
              setupTask: data.selectedSetupTask,
            }),
          });

          if (response.ok) {
            console.log('✅ Onboarding completed successfully');
            setStatus('Onboarding completed! Redirecting...');
            
            // Clear sessionStorage
            sessionStorage.removeItem('pendingOnboarding');
            
            // Redirect to dashboard
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          } else {
            throw new Error('Failed to save onboarding data');
          }
        } else {
          console.log('⚠️ No onboarding data found, redirecting to dashboard');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('❌ Error completing onboarding:', error);
        setStatus('Error completing onboarding. Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    };

    completeOnboarding();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          {status}
        </p>
        <div className="animate-pulse">
          <div className="h-2 bg-gray-200 rounded mb-2"></div>
          <div className="h-2 bg-gray-200 rounded mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
} 