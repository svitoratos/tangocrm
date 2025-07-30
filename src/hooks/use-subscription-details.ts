import { useState, useEffect } from 'react';

interface SubscriptionDetails {
  id: string;
  status: string;
  current_period_end: number;
  billing_interval: 'month' | 'year';
  billing_interval_count: number;
  amount: number;
  currency: string;
  product_id: string;
  discount_applied: string | null;
  discount_end: number | null;
}

interface UseSubscriptionDetailsReturn {
  subscriptionDetails: SubscriptionDetails | null;
  isLoading: boolean;
  error: string | null;
  formatCurrency: (amount: number, currency: string) => string;
  formatDate: (timestamp: number) => string;
  isYearlySubscription: boolean;
  isMonthlySubscription: boolean;
}

export const useSubscriptionDetails = (): UseSubscriptionDetailsReturn => {
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/user/subscription-details');
        const data = await response.json();

        if (response.ok && data.success) {
          setSubscriptionDetails(data.subscription);
        } else {
          setError(data.error || 'Failed to fetch subscription details');
        }
      } catch (err) {
        setError('Failed to fetch subscription details');
        console.error('Error fetching subscription details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, []);

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isYearlySubscription = subscriptionDetails?.billing_interval === 'year';
  const isMonthlySubscription = subscriptionDetails?.billing_interval === 'month';

  return {
    subscriptionDetails,
    isLoading,
    error,
    formatCurrency,
    formatDate,
    isYearlySubscription,
    isMonthlySubscription,
  };
}; 