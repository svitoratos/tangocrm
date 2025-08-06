"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [processingStatus, setProcessingStatus] = useState('Processing your payment...');

  useEffect(() => {
    // Wait for webhook to process before redirecting
    const waitForPaymentProcessing = async () => {
      console.log('🔧 Payment success page loaded');
      console.log('🔧 Referrer:', document.referrer);
      
      // Get the selected niche from sessionStorage
      const selectedNiche = sessionStorage.getItem('pendingNicheUpgrade');
      console.log('🔧 Selected niche from sessionStorage:', selectedNiche);
      
      // Clear the stored niche
      sessionStorage.removeItem('pendingNicheUpgrade');
      
      // Wait for webhook to process (up to 10 seconds)
      let attempts = 0;
      const maxAttempts = 20; // 20 attempts * 500ms = 10 seconds
      
      while (attempts < maxAttempts) {
        try {
          console.log(`🔧 Checking payment status (attempt ${attempts + 1}/${maxAttempts})`);
          setProcessingStatus(`Processing your payment... (${attempts + 1}/${maxAttempts})`);
          
          const response = await fetch('/api/user/payment-status');
          if (response.ok) {
            const { hasActiveSubscription, hasCompletedOnboarding } = await response.json();
            
            console.log('🔧 Payment status check:', { hasActiveSubscription, hasCompletedOnboarding });
            
            if (hasActiveSubscription) {
              console.log('🔧 Payment processed successfully, proceeding with redirect');
              setProcessingStatus('Payment confirmed! Redirecting...');
              break;
            }
          }
        } catch (error) {
          console.log('🔧 Payment status check failed:', error);
        }
        
        // Wait 500ms before next attempt
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        console.log('🔧 Payment processing timeout, proceeding anyway');
      }
      
      // Now proceed with the redirect logic
      if (selectedNiche) {
        // If we have a specific niche from the upgrade modal, use it
        console.log('🔧 Using niche from sessionStorage:', selectedNiche);
        const redirectUrl = `/onboarding/success?upgrade=true&niche=${selectedNiche}&niches=%5B%22${selectedNiche}%22%5D&specific_niche=${selectedNiche}`;
        console.log('🔧 Redirecting to:', redirectUrl);
        router.push(redirectUrl);
      } else {
        // Check if user came from the coach payment links
        const referrer = document.referrer;
        console.log('🔧 Checking referrer for payment links...');
        
        if (referrer.includes('buy.stripe.com/5kQ3cw5l086faBieOE2Nq05') || 
            referrer.includes('buy.stripe.com/00w5kEcNs1HR10IdKA2Nq03')) {
          console.log('🔧 Detected coach niche payment link, adding coach niche');
          router.push('/onboarding/success?upgrade=true&niche=coach&niches=%5B%22coach%22%5D&specific_niche=coach');
        } else if (referrer.includes('buy.stripe.com/fZu14o7t83PZeRy35W2Nq06') || 
                   referrer.includes('buy.stripe.com/7sY6oI6p44U3gZGgWM2Nq07')) {
          console.log('🔧 Detected creator niche payment link, adding creator niche');
          router.push('/onboarding/success?upgrade=true&niche=creator&niches=%5B%22creator%22%5D&specific_niche=creator');
        } else if (referrer.includes('buy.stripe.com/14AcN65l00DNbFm9uk2Nq08') || 
                   referrer.includes('buy.stripe.com/28E3cw3cSdqz9xe0XO2Nq09')) {
          console.log('🔧 Detected podcaster niche payment link, adding podcaster niche');
          router.push('/onboarding/success?upgrade=true&niche=podcaster&niches=%5B%22podcaster%22%5D&specific_niche=podcaster');
        } else if (referrer.includes('buy.stripe.com/3cI7sMcNs5Y710I21S2Nq0a') || 
                   referrer.includes('buy.stripe.com/5kQ9AU6p4cmvfVC35W2Nq0b')) {
          console.log('🔧 Detected freelancer niche payment link, adding freelancer niche');
          router.push('/onboarding/success?upgrade=true&niche=freelancer&niches=%5B%22freelancer%22%5D&specific_niche=freelancer');
        } else {
          console.log('🔧 No specific payment link detected, redirecting to dashboard');
          // If no specific niche (coming from other hardcoded payment link), 
          // redirect to dashboard without making assumptions
          router.push('/dashboard?upgrade=success');
        }
      }
    };

    // Start the payment processing wait
    waitForPaymentProcessing();
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
          {processingStatus}
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