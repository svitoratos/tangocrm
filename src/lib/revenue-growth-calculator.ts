import { supabase } from '@/lib/supabase';

/**
 * Revenue Growth Rate Calculator for Tango CRM
 * Supports multiple time periods and handles edge cases properly
 */

export interface GrowthRateResult {
  growthRate: number;
  absoluteChange: number;
  currentPeriod: number;
  previousPeriod: number;
  periodType: 'month' | 'quarter' | 'year' | 'custom';
  isPositiveGrowth: boolean;
  message: string;
  startDate?: Date;
  endDate?: Date;
  previousStartDate?: Date;
  previousEndDate?: Date;
}

export interface GrowthRateOptions {
  periodType: 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
  includeAbsoluteChange?: boolean;
  precision?: number;
  userId: string;
  niche: string;
}

export interface CustomPeriodOptions {
  currentStartDate: Date;
  currentEndDate: Date;
  previousStartDate: Date;
  previousEndDate: Date;
  userId: string;
  niche: string;
}

export class RevenueGrowthCalculator {
  private defaultPrecision = 2;

  /**
   * Calculate growth rate for a specific period type
   */
  async calculateGrowthRate(options: GrowthRateOptions): Promise<GrowthRateResult> {
    try {
      const { periodType, startDate, endDate, userId, niche, precision = this.defaultPrecision } = options;

      let currentPeriodRevenue: number;
      let previousPeriodRevenue: number;
      let periodDates: {
        currentStart: Date;
        currentEnd: Date;
        previousStart: Date;
        previousEnd: Date;
      };

      switch (periodType) {
        case 'month':
          periodDates = this.getMonthPeriods();
          break;
        case 'quarter':
          periodDates = this.getQuarterPeriods();
          break;
        case 'year':
          periodDates = this.getYearPeriods();
          break;
        case 'custom':
          if (!startDate || !endDate) {
            throw new Error('Custom period requires both startDate and endDate');
          }
          periodDates = this.getCustomPeriods(startDate, endDate);
          break;
        default:
          throw new Error(`Invalid period type: ${periodType}`);
      }

      // Fetch revenue data for both periods
      currentPeriodRevenue = await this.fetchRevenueForPeriod(
        periodDates.currentStart,
        periodDates.currentEnd,
        userId,
        niche
      );

      previousPeriodRevenue = await this.fetchRevenueForPeriod(
        periodDates.previousStart,
        periodDates.previousEnd,
        userId,
        niche
      );

      return this.calculateGrowthRateFromValues({
        currentPeriodRevenue,
        previousPeriodRevenue,
        periodType,
        precision,
        startDate: periodDates.currentStart,
        endDate: periodDates.currentEnd,
        previousStartDate: periodDates.previousStart,
        previousEndDate: periodDates.previousEnd
      });

    } catch (error) {
      console.error('Error calculating growth rate:', error);
      return this.createErrorResult(options.periodType, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Calculate growth rate from direct revenue values
   */
  calculateGrowthRateFromValues(params: {
    currentPeriodRevenue: number;
    previousPeriodRevenue: number;
    periodType: 'month' | 'quarter' | 'year' | 'custom';
    precision?: number;
    startDate?: Date;
    endDate?: Date;
    previousStartDate?: Date;
    previousEndDate?: Date;
  }): GrowthRateResult {
    const {
      currentPeriodRevenue,
      previousPeriodRevenue,
      periodType,
      precision = this.defaultPrecision,
      startDate,
      endDate,
      previousStartDate,
      previousEndDate
    } = params;

    // Handle edge cases
    if (currentPeriodRevenue === 0 && previousPeriodRevenue === 0) {
      return {
        growthRate: 0,
        absoluteChange: 0,
        currentPeriod: 0,
        previousPeriod: 0,
        periodType,
        isPositiveGrowth: false,
        message: 'No revenue data available for both periods',
        startDate,
        endDate,
        previousStartDate,
        previousEndDate
      };
    }

    if (previousPeriodRevenue === 0 && currentPeriodRevenue > 0) {
      return {
        growthRate: 100,
        absoluteChange: currentPeriodRevenue,
        currentPeriod: currentPeriodRevenue,
        previousPeriod: 0,
        periodType,
        isPositiveGrowth: true,
        message: 'New revenue generated (no previous period data)',
        startDate,
        endDate,
        previousStartDate,
        previousEndDate
      };
    }

    if (previousPeriodRevenue === 0 && currentPeriodRevenue === 0) {
      return {
        growthRate: 0,
        absoluteChange: 0,
        currentPeriod: 0,
        previousPeriod: 0,
        periodType,
        isPositiveGrowth: false,
        message: 'No revenue data available',
        startDate,
        endDate,
        previousStartDate,
        previousEndDate
      };
    }

    // Calculate growth rate
    const absoluteChange = currentPeriodRevenue - previousPeriodRevenue;
    const growthRate = (absoluteChange / previousPeriodRevenue) * 100;
    const isPositiveGrowth = growthRate >= 0;

    // Format message based on period type
    const message = this.formatGrowthMessage(growthRate, periodType, isPositiveGrowth);

    return {
      growthRate: Number(growthRate.toFixed(precision)),
      absoluteChange: Number(absoluteChange.toFixed(2)),
      currentPeriod: Number(currentPeriodRevenue.toFixed(2)),
      previousPeriod: Number(previousPeriodRevenue.toFixed(2)),
      periodType,
      isPositiveGrowth,
      message,
      startDate,
      endDate,
      previousStartDate,
      previousEndDate
    };
  }

  /**
   * Calculate custom period growth rate
   */
  async calculateCustomPeriodGrowthRate(options: CustomPeriodOptions): Promise<GrowthRateResult> {
    try {
      const { currentStartDate, currentEndDate, previousStartDate, previousEndDate, userId, niche } = options;

      // Validate date ranges
      this.validateDateRange(currentStartDate, currentEndDate);
      this.validateDateRange(previousStartDate, previousEndDate);

      const currentPeriodRevenue = await this.fetchRevenueForPeriod(
        currentStartDate,
        currentEndDate,
        userId,
        niche
      );

      const previousPeriodRevenue = await this.fetchRevenueForPeriod(
        previousStartDate,
        previousEndDate,
        userId,
        niche
      );

      return this.calculateGrowthRateFromValues({
        currentPeriodRevenue,
        previousPeriodRevenue,
        periodType: 'custom',
        startDate: currentStartDate,
        endDate: currentEndDate,
        previousStartDate,
        previousEndDate
      });

    } catch (error) {
      console.error('Error calculating custom period growth rate:', error);
      return this.createErrorResult('custom', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Calculate trend analysis for multiple consecutive periods
   */
  async calculateTrendAnalysis(params: {
    periods: number;
    periodType: 'month' | 'quarter' | 'year';
    userId: string;
    niche: string;
  }): Promise<GrowthRateResult[]> {
    const { periods, periodType, userId, niche } = params;
    const results: GrowthRateResult[] = [];

    for (let i = 0; i < periods; i++) {
      const currentDate = new Date();
      
      // Calculate dates for current and previous periods
      let currentStart: Date;
      let currentEnd: Date;
      let previousStart: Date;
      let previousEnd: Date;

      switch (periodType) {
        case 'month':
          currentEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 0);
          currentStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i - 1, 1);
          previousEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i - 1, 0);
          previousStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i - 2, 1);
          break;
        case 'quarter':
          const currentQuarter = Math.floor(currentDate.getMonth() / 3) - i;
          const currentYear = currentDate.getFullYear();
          currentStart = new Date(currentYear, currentQuarter * 3, 1);
          currentEnd = new Date(currentYear, (currentQuarter + 1) * 3, 0);
          previousStart = new Date(currentYear, (currentQuarter - 1) * 3, 1);
          previousEnd = new Date(currentYear, currentQuarter * 3, 0);
          break;
        case 'year':
          const year = currentDate.getFullYear() - i;
          currentStart = new Date(year, 0, 1);
          currentEnd = new Date(year, 11, 31);
          previousStart = new Date(year - 1, 0, 1);
          previousEnd = new Date(year - 1, 11, 31);
          break;
      }

      const result = await this.calculateCustomPeriodGrowthRate({
        currentStartDate: currentStart,
        currentEndDate: currentEnd,
        previousStartDate: previousStart,
        previousEndDate: previousEnd,
        userId,
        niche
      });

      results.push(result);
    }

    return results;
  }

  /**
   * Fetch revenue data from database for a specific period
   */
  private async fetchRevenueForPeriod(
    startDate: Date,
    endDate: Date,
    userId: string,
    niche: string
  ): Promise<number> {
    try {
      // For coach niche, include both 'won' and 'paid' statuses
      const statusFilter = niche === 'coach' ? ['won', 'paid'] : ['won'];

      const { data: opportunities, error } = await supabase
        .from('opportunities')
        .select('value, created_at')
        .eq('user_id', userId)
        .eq('niche', niche)
        .in('status', statusFilter)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) {
        console.error('Error fetching revenue data:', error);
        return 0;
      }

      return opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
    } catch (error) {
      console.error('Error fetching revenue for period:', error);
      return 0;
    }
  }

  /**
   * Get month periods (current month vs previous month)
   */
  private getMonthPeriods() {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    return {
      currentStart: currentMonth,
      currentEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      previousStart: previousMonth,
      previousEnd: new Date(now.getFullYear(), now.getMonth(), 0)
    };
  }

  /**
   * Get quarter periods (current quarter vs previous quarter)
   */
  private getQuarterPeriods() {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const currentYear = now.getFullYear();

    const currentQuarterStart = new Date(currentYear, currentQuarter * 3, 1);
    const currentQuarterEnd = new Date(currentYear, (currentQuarter + 1) * 3, 0);
    const previousQuarterStart = new Date(currentYear, (currentQuarter - 1) * 3, 1);
    const previousQuarterEnd = new Date(currentYear, currentQuarter * 3, 0);

    return {
      currentStart: currentQuarterStart,
      currentEnd: currentQuarterEnd,
      previousStart: previousQuarterStart,
      previousEnd: previousQuarterEnd
    };
  }

  /**
   * Get year periods (current year vs previous year)
   */
  private getYearPeriods() {
    const now = new Date();
    const currentYear = now.getFullYear();

    return {
      currentStart: new Date(currentYear, 0, 1),
      currentEnd: new Date(currentYear, 11, 31),
      previousStart: new Date(currentYear - 1, 0, 1),
      previousEnd: new Date(currentYear - 1, 11, 31)
    };
  }

  /**
   * Get custom periods based on provided dates
   */
  private getCustomPeriods(startDate: Date, endDate: Date) {
    const duration = endDate.getTime() - startDate.getTime();
    const previousEndDate = new Date(startDate.getTime() - 1);
    const previousStartDate = new Date(previousEndDate.getTime() - duration);

    return {
      currentStart: startDate,
      currentEnd: endDate,
      previousStart: previousStartDate,
      previousEnd: previousEndDate
    };
  }

  /**
   * Validate date range
   */
  private validateDateRange(startDate: Date, endDate: Date) {
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date provided');
    }
  }

  /**
   * Format growth message based on period type and growth rate
   */
  private formatGrowthMessage(growthRate: number, periodType: string, isPositiveGrowth: boolean): string {
    const periodLabel = this.getPeriodLabel(periodType);
    const direction = isPositiveGrowth ? 'growth' : 'decline';
    const absRate = Math.abs(growthRate);

    if (growthRate === 0) {
      return `No change compared to previous ${periodLabel}`;
    }

    if (growthRate === 100 && periodType !== 'custom') {
      return `New revenue generated (no previous ${periodLabel} data)`;
    }

    return `${absRate.toFixed(2)}% ${direction} compared to previous ${periodLabel}`;
  }

  /**
   * Get period label for messages
   */
  private getPeriodLabel(periodType: string): string {
    switch (periodType) {
      case 'month': return 'month';
      case 'quarter': return 'quarter';
      case 'year': return 'year';
      case 'custom': return 'period';
      default: return 'period';
    }
  }

  /**
   * Create error result
   */
  private createErrorResult(periodType: 'month' | 'quarter' | 'year' | 'custom', errorMessage: string): GrowthRateResult {
    return {
      growthRate: 0,
      absoluteChange: 0,
      currentPeriod: 0,
      previousPeriod: 0,
      periodType,
      isPositiveGrowth: false,
      message: `Error: ${errorMessage}`,
    };
  }

  /**
   * Export growth data to CSV format
   */
  exportToCSV(results: GrowthRateResult[]): string {
    const headers = [
      'Period Type',
      'Growth Rate (%)',
      'Absolute Change ($)',
      'Current Period ($)',
      'Previous Period ($)',
      'Is Positive Growth',
      'Message',
      'Start Date',
      'End Date'
    ];

    const rows = results.map(result => [
      result.periodType,
      result.growthRate,
      result.absoluteChange,
      result.currentPeriod,
      result.previousPeriod,
      result.isPositiveGrowth,
      result.message,
      result.startDate?.toISOString().split('T')[0] || '',
      result.endDate?.toISOString().split('T')[0] || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Export growth data to JSON format
   */
  exportToJSON(results: GrowthRateResult[]): string {
    return JSON.stringify(results, null, 2);
  }
}

// Export singleton instance
export const revenueGrowthCalculator = new RevenueGrowthCalculator(); 