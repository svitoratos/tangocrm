'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CancellationForm from '@/components/forms/cancellation-form';
import { useAuth } from '@clerk/nextjs';

interface CancellationFormData {
  reason: string;
  customReason?: string;
  improvement?: string;
  comeback?: string;
}

export default function CancelSubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { userId } = useAuth();

  const handleSubmit = async (data: CancellationFormData) => {
    setIsLoading(true);
    
    try {
      // Submit cancellation data to your API
      const response = await fetch('/api/user/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          reason: data.reason,
          customReason: data.customReason,
          improvement: data.improvement,
          comeback: data.comeback,
        }),
      });

      if (response.ok) {
        // Redirect to cancellation confirmation page
        router.push('/cancellation-confirmed');
      } else {
        // Handle error
        console.error('Failed to cancel subscription');
        alert('An error occurred while canceling your subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('An error occurred while canceling your subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Redirect back to dashboard or billing page
    router.push('/dashboard/settings');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <CancellationForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}