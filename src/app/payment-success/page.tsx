"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Add a small delay to ensure the page loads properly
    const timer = setTimeout(() => {
      // Get the selected niche from sessionStorage
      const selectedNiche = sessionStorage.getItem('pendingNicheUpgrade');
      
      // Clear the stored niche
      sessionStorage.removeItem('pendingNicheUpgrade');
      
      // Redirect to the onboarding success page with niche upgrade parameters
      if (selectedNiche) {
        router.push(`/onboarding/success?upgrade=true&niche=${selectedNiche}&niches=%5B%22${selectedNiche}%22%5D`);
      } else {
        router.push('/onboarding/success?upgrade=true');
      }
    }, 1000);

    return () => clearTimeout(timer);
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
          Thank you for your purchase. We're setting up your new niche access...
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