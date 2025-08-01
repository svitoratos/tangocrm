import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { revenueGrowthCalculator, GrowthRateOptions, CustomPeriodOptions } from '@/lib/revenue-growth-calculator';

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const periodType = searchParams.get('periodType') as 'month' | 'quarter' | 'year' | 'custom';
    const niche = searchParams.get('niche') || 'creator';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const precision = parseInt(searchParams.get('precision') || '2');
    const trendPeriods = parseInt(searchParams.get('trendPeriods') || '0');

    // Validate required parameters
    if (!periodType) {
      return NextResponse.json({ error: 'periodType is required' }, { status: 400 });
    }

    if (periodType === 'custom' && (!startDate || !endDate)) {
      return NextResponse.json({ error: 'startDate and endDate are required for custom periods' }, { status: 400 });
    }

    // Calculate growth rate
    const options: GrowthRateOptions = {
      periodType,
      userId: user.id,
      niche,
      precision
    };

    if (startDate && endDate) {
      options.startDate = new Date(startDate);
      options.endDate = new Date(endDate);
    }

    const result = await revenueGrowthCalculator.calculateGrowthRate(options);

    // If trend analysis is requested
    if (trendPeriods > 0 && periodType !== 'custom') {
      const trendResults = await revenueGrowthCalculator.calculateTrendAnalysis({
        periods: trendPeriods,
        periodType,
        userId: user.id,
        niche
      });

      return NextResponse.json({
        currentPeriod: result,
        trendAnalysis: trendResults
      });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in revenue growth API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      currentStartDate, 
      currentEndDate, 
      previousStartDate, 
      previousEndDate, 
      niche = 'creator' 
    } = body;

    // Validate required parameters
    if (!currentStartDate || !currentEndDate || !previousStartDate || !previousEndDate) {
      return NextResponse.json({ 
        error: 'currentStartDate, currentEndDate, previousStartDate, and previousEndDate are required' 
      }, { status: 400 });
    }

    const options: CustomPeriodOptions = {
      currentStartDate: new Date(currentStartDate),
      currentEndDate: new Date(currentEndDate),
      previousStartDate: new Date(previousStartDate),
      previousEndDate: new Date(previousEndDate),
      userId: user.id,
      niche
    };

    const result = await revenueGrowthCalculator.calculateCustomPeriodGrowthRate(options);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in custom period revenue growth API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 