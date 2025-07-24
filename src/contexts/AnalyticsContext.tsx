'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAnalytics } from '@/hooks/use-analytics';
import { AnalyticsData, NicheSpecificMetrics } from '@/lib/analytics-service';

interface AnalyticsContextType {
  data: (AnalyticsData & NicheSpecificMetrics) | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  activeNiche: string;
  setActiveNiche: (niche: string) => void;
  isRealTimeEnabled: boolean;
  toggleRealTime: () => void;
  lastUpdated: Date | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [activeNiche, setActiveNiche] = useState('creator');
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { 
    data, 
    loading, 
    error, 
    refresh,
    subscribeToUpdates 
  } = useAnalytics({
    niche: activeNiche,
    autoRefresh: isRealTimeEnabled,
    refreshInterval: 30000 // 30 seconds
  });

  // Update last updated timestamp when data changes
  useEffect(() => {
    if (data) {
      setLastUpdated(new Date());
    }
  }, [data]);

  // Set up real-time subscription
  useEffect(() => {
    if (!isRealTimeEnabled || !user?.id) return;

    const unsubscribe = subscribeToUpdates((newData) => {
      setLastUpdated(new Date());
    });

    return unsubscribe;
  }, [isRealTimeEnabled, subscribeToUpdates, user?.id]);

  const toggleRealTime = useCallback(() => {
    setIsRealTimeEnabled(prev => !prev);
  }, []);

  const value: AnalyticsContextType = {
    data,
    loading,
    error,
    refresh,
    activeNiche,
    setActiveNiche,
    isRealTimeEnabled,
    toggleRealTime,
    lastUpdated
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
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