"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    console.log('🔧 Payment success page loaded');
    
    const processPayment = async () => {
      try {
        // Get onboarding data from sessionStorage
        const pendingOnboarding = sessionStorage.getItem('pendingOnboarding');
        
        if (pendingOnboarding) {
          const onboardingData = JSON.parse(pendingOnboarding);
          console.log('🔧 Processing onboarding data:', onboardingData);
          
          // Persist chosen niche so sidebar uses it right away
          const chosen = onboardingData.selectedRoles?.[0] || 'creator';
          if (chosen) {
            localStorage.setItem('selectedNiche', chosen);
          }
          
          // Call API to update user with onboarding data
          const response = await fetch('/api/user/process-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ onboardingData }),
          });

          if (response.ok) {
            console.log('✅ Payment processed successfully');
            // Clear sessionStorage
            sessionStorage.removeItem('pendingOnboarding');
          } else {
            const errorData = await response.json();
            console.error('❌ Failed to process payment:', errorData);
          }
        } else {
          console.log('⚠️ No pending onboarding data found');
        }
      } catch (error) {
        console.error('❌ Error processing payment:', error);
      } finally {
        setProcessing(false);
      }
    };

    processPayment();
  }, []);

  useEffect(() => {
    if (!processing) {
      // Start countdown after payment processing
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            console.log('🔧 Redirecting to onboarding success');
            router.push('/onboarding/success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [processing, router]);

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
            {processing ? (
              'Processing your payment...'
            ) : (
              `Setting up your CRM... redirecting in ${countdown} seconds...`
            )}
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