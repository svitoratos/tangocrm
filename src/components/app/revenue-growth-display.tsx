import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { GrowthRateResult } from '@/lib/revenue-growth-calculator';
import { useRevenueGrowth } from '@/hooks/use-revenue-growth';

interface RevenueGrowthDisplayProps {
  periodType: 'month' | 'quarter' | 'year' | 'custom';
  niche?: string;
  startDate?: Date;
  endDate?: Date;
  precision?: number;
  showDetails?: boolean;
  className?: string;
  title?: string;
}

export function RevenueGrowthDisplay({
  periodType,
  niche = 'creator',
  startDate,
  endDate,
  precision = 2,
  showDetails = true,
  className = '',
  title
}: RevenueGrowthDisplayProps) {
  const { growthRate, loading, error, calculateGrowthRate } = useRevenueGrowth({
    periodType,
    niche,
    startDate,
    endDate,
    precision,
    autoFetch: true
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthIcon = () => {
    if (!growthRate) return <Minus className="w-4 h-4" />;
    
    if (growthRate.isPositiveGrowth) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
  };

  const getGrowthColor = () => {
    if (!growthRate) return 'text-gray-500';
    
    if (growthRate.isPositiveGrowth) {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  const getPeriodLabel = () => {
    switch (periodType) {
      case 'month': return 'Month-over-Month';
      case 'quarter': return 'Quarter-over-Quarter';
      case 'year': return 'Year-over-Year';
      case 'custom': return 'Custom Period';
      default: return 'Growth Rate';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            {title || getPeriodLabel()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            {title || getPeriodLabel()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Error loading growth rate</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!growthRate) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            {title || getPeriodLabel()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 text-sm">No data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">
          {title || getPeriodLabel()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Main Growth Rate Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getGrowthIcon()}
              <span className={`text-2xl font-bold ${getGrowthColor()}`}>
                {growthRate.growthRate.toFixed(precision)}%
              </span>
            </div>
            <Badge 
              variant={growthRate.isPositiveGrowth ? "default" : "destructive"}
              className={growthRate.isPositiveGrowth ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
            >
              {growthRate.isPositiveGrowth ? 'Growth' : 'Decline'}
            </Badge>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600">
            {growthRate.message}
          </p>

          {/* Detailed Information */}
          {showDetails && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current Period:</span>
                <span className="font-medium">{formatCurrency(growthRate.currentPeriod)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Previous Period:</span>
                <span className="font-medium">{formatCurrency(growthRate.previousPeriod)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Absolute Change:</span>
                <span className={`font-medium ${growthRate.absoluteChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growthRate.absoluteChange >= 0 ? '+' : ''}{formatCurrency(growthRate.absoluteChange)}
                </span>
              </div>
              
              {/* Date Range Information */}
              {growthRate.startDate && growthRate.endDate && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Current Period:</div>
                  <div className="text-xs">
                    {growthRate.startDate.toLocaleDateString()} - {growthRate.endDate.toLocaleDateString()}
                  </div>
                  {growthRate.previousStartDate && growthRate.previousEndDate && (
                    <>
                      <div className="text-xs text-gray-500 mb-1 mt-2">Previous Period:</div>
                      <div className="text-xs">
                        {growthRate.previousStartDate.toLocaleDateString()} - {growthRate.previousEndDate.toLocaleDateString()}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for dashboard widgets
export function RevenueGrowthCompact({
  periodType,
  niche = 'creator',
  className = ''
}: {
  periodType: 'month' | 'quarter' | 'year';
  niche?: string;
  className?: string;
}) {
  const { growthRate, loading, error } = useRevenueGrowth({
    periodType,
    niche,
    autoFetch: true
  });

  const getGrowthIcon = () => {
    if (!growthRate) return <Minus className="w-4 h-4 text-gray-400" />;
    
    if (growthRate.isPositiveGrowth) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
  };

  const getGrowthColor = () => {
    if (!growthRate) return 'text-gray-500';
    
    if (growthRate.isPositiveGrowth) {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse h-4 w-4 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-4 w-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !growthRate) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <Minus className="w-4 h-4" />
        <span className="text-sm">N/A</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getGrowthIcon()}
      <span className={`text-sm font-medium ${getGrowthColor()}`}>
        {growthRate.growthRate.toFixed(1)}%
      </span>
    </div>
  );
} 