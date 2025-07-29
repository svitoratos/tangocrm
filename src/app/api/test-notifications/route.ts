import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    console.log('🧪 Test Notifications API called for userId:', userId);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Test basic database connection
    console.log('🧪 Testing basic database connection...');
    
    try {
      // Try to get user profile first
      const profile = await userOperations.getProfile(userId);
      console.log('🧪 User profile test result:', !!profile);
      
      if (!profile) {
        return NextResponse.json({
          error: 'User profile not found',
          userId,
          test: 'profile_lookup'
        });
      }

      // Test notification preferences with detailed error handling
      console.log('🧪 Testing notification preferences...');
      
      try {
        const preferences = await userOperations.getNotificationPreferences(userId);
        console.log('🧪 Notification preferences test result:', preferences);
        
        return NextResponse.json({
          success: true,
          userId,
          profile: {
            id: profile.id,
            email: profile.email,
            hasProfile: true
          },
          notificationPreferences: preferences,
          test: 'notification_preferences'
        });
      } catch (prefError: any) {
        console.log('🧪 Notification preferences error:', {
          message: prefError.message,
          code: prefError.code,
          details: prefError.details
        });
        
        return NextResponse.json({
          success: false,
          userId,
          profile: {
            id: profile.id,
            email: profile.email,
            hasProfile: true
          },
          error: 'notification_preferences_failed',
          errorDetails: {
            message: prefError.message,
            code: prefError.code,
            details: prefError.details
          },
          test: 'notification_preferences_error'
        });
      }
      
    } catch (profileError: any) {
      console.log('🧪 Profile lookup error:', profileError);
      
      return NextResponse.json({
        success: false,
        userId,
        error: 'profile_lookup_failed',
        errorDetails: {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details
        },
        test: 'profile_lookup_error'
      });
    }

  } catch (error) {
    console.error('❌ Test API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'api_error',
      errorDetails: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error
      },
      test: 'api_error'
    }, { status: 500 });
  }
} 