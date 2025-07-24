import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { analyticsService, AnalyticsData, NicheSpecificMetrics } from '@/lib/analytics-service';

interface UseAnalyticsOptions {
  niche: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseAnalyticsReturn {
  data: (AnalyticsData & NicheSpecificMetrics) | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  subscribeToUpdates: (callback: (data: AnalyticsData) => void) => () => void;
}

export function useAnalytics({ 
  niche, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: UseAnalyticsOptions): UseAnalyticsReturn {
  const { user } = useUser();
  const [data, setData] = useState<(AnalyticsData & NicheSpecificMetrics) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Set the userId in the analytics service
      analyticsService.setUserId(user.id);
      
      const analyticsData = await analyticsService.getAnalyticsData(niche, user.id);
      setData(analyticsData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [niche, user?.id]);

  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [fetchData, user?.id]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !user?.id) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData, user?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!autoRefresh || !user?.id) return;

    const sub = analyticsService.subscribeToRealTimeUpdates((newData) => {
      setData(prevData => ({ ...prevData, ...newData }));
    });

    setSubscription(sub);

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [autoRefresh, user?.id]);

  const subscribeToUpdates = useCallback((callback: (data: AnalyticsData) => void) => {
    if (!user?.id) return () => {};
    
    const sub = analyticsService.subscribeToRealTimeUpdates(callback);
    return () => sub?.unsubscribe();
  }, [user?.id]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    subscribeToUpdates
  };
}

// Specialized hooks for different niches
export function useCreatorAnalytics() {
  return useAnalytics({ niche: 'creator' });
}

export function useCoachAnalytics() {
  return useAnalytics({ niche: 'coach' });
}

export function usePodcasterAnalytics() {
  return useAnalytics({ niche: 'podcaster' });
}

export function useFreelancerAnalytics() {
  return useAnalytics({ niche: 'freelancer' });
} 