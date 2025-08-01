import { useState, useEffect, useCallback } from 'react';
import { GrowthRateResult, GrowthRateOptions, CustomPeriodOptions } from '@/lib/revenue-growth-calculator';

interface UseRevenueGrowthOptions {
  periodType: 'month' | 'quarter' | 'year' | 'custom';
  niche?: string;
  startDate?: Date;
  endDate?: Date;
  precision?: number;
  autoFetch?: boolean;
}

interface UseRevenueGrowthReturn {
  growthRate: GrowthRateResult | null;
  loading: boolean;
  error: string | null;
  calculateGrowthRate: (options?: Partial<GrowthRateOptions>) => Promise<void>;
  calculateCustomPeriod: (options: CustomPeriodOptions) => Promise<void>;
  calculateTrendAnalysis: (periods: number) => Promise<GrowthRateResult[]>;
  reset: () => void;
}

export function useRevenueGrowth(options: UseRevenueGrowthOptions): UseRevenueGrowthReturn {
  const [growthRate, setGrowthRate] = useState<GrowthRateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateGrowthRate = useCallback(async (overrideOptions?: Partial<GrowthRateOptions>) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        periodType: options.periodType,
        niche: options.niche || 'creator',
        precision: (options.precision || 2).toString()
      });

      if (options.startDate && options.endDate) {
        params.append('startDate', options.startDate.toISOString());
        params.append('endDate', options.endDate.toISOString());
      }

      if (overrideOptions?.startDate && overrideOptions?.endDate) {
        params.set('startDate', overrideOptions.startDate.toISOString());
        params.set('endDate', overrideOptions.endDate.toISOString());
      }

      const response = await fetch(`/api/analytics/revenue-growth?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setGrowthRate(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate growth rate';
      setError(errorMessage);
      console.error('Error calculating growth rate:', err);
    } finally {
      setLoading(false);
    }
  }, [options.periodType, options.niche, options.startDate, options.endDate, options.precision]);

  const calculateCustomPeriod = useCallback(async (customOptions: CustomPeriodOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/revenue-growth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentStartDate: customOptions.currentStartDate.toISOString(),
          currentEndDate: customOptions.currentEndDate.toISOString(),
          previousStartDate: customOptions.previousStartDate.toISOString(),
          previousEndDate: customOptions.previousEndDate.toISOString(),
          niche: customOptions.niche
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setGrowthRate(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate custom period growth rate';
      setError(errorMessage);
      console.error('Error calculating custom period growth rate:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateTrendAnalysis = useCallback(async (periods: number): Promise<GrowthRateResult[]> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        periodType: options.periodType,
        niche: options.niche || 'creator',
        trendPeriods: periods.toString()
      });

      const response = await fetch(`/api/analytics/revenue-growth?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.trendAnalysis) {
        return result.trendAnalysis;
      }
      
      return [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate trend analysis';
      setError(errorMessage);
      console.error('Error calculating trend analysis:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [options.periodType, options.niche]);

  const reset = useCallback(() => {
    setGrowthRate(null);
    setError(null);
    setLoading(false);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (options.autoFetch !== false) {
      calculateGrowthRate();
    }
  }, [calculateGrowthRate, options.autoFetch]);

  return {
    growthRate,
    loading,
    error,
    calculateGrowthRate,
    calculateCustomPeriod,
    calculateTrendAnalysis,
    reset
  };
} 