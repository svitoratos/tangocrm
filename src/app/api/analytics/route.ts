import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { analyticsService } from '@/lib/analytics-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche') || 'creator';

    // Set the userId in the analytics service
    analyticsService.setUserId(userId);

    // Get comprehensive analytics data
    const analyticsData = await analyticsService.getAnalyticsData(niche, userId);

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 