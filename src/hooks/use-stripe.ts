import { useState } from 'react';
import { getStripe } from '@/lib/stripe';

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (priceId: string, niche: string, billingCycle: 'monthly' | 'yearly') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          niche,
          billingCycle,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔧 Opening customer portal...');
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🔧 Portal API response status:', response.status);
      
      const data = await response.json();
      console.log('🔧 Portal API response data:', data);

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 401) {
          throw new Error('You must be logged in to access billing management');
        } else if (response.status === 404) {
          throw new Error('User profile not found. Please complete your profile setup');
        } else if (response.status === 400) {
          throw new Error(data.error || 'Invalid request. Please check your profile information');
        } else if (response.status === 500) {
          throw new Error(data.error || 'Server error. Please try again or contact support');
        } else {
          throw new Error(data.error || `Request failed with status ${response.status}`);
        }
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        console.log('✅ Redirecting to billing portal:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received from server');
      }
    } catch (err) {
      console.error('❌ Error opening customer portal:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to open billing portal';
      setError(errorMessage);
      throw err; // Re-throw so the component can handle it
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    openCustomerPortal,
    loading,
    error,
  };
}; 