import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user || user.email !== 'stevenvitoratos@getbondlyapp.com') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('🔍 Admin: Monitoring user ID mismatches...');

    // Get all users
    const { data: allUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    console.log(`📊 Found ${allUsers.length} users to check`);

    const results = {
      totalUsers: allUsers.length,
      mismatchesFound: 0,
      potentialIssues: 0,
      details: [] as any[],
      summary: {
        usersWithMultipleIds: 0,
        usersWithIncompleteData: 0,
        usersWithNoNiches: 0,
        usersWithInactiveSubscriptions: 0
      }
    };

    // Group users by email to find duplicates
    const usersByEmail = new Map<string, any[]>();
    
    allUsers.forEach(user => {
      if (user.email) {
        if (!usersByEmail.has(user.email)) {
          usersByEmail.set(user.email, []);
        }
        usersByEmail.get(user.email)!.push(user);
      }
    });

    // Check for email duplicates (potential ID mismatches)
    for (const [email, users] of usersByEmail.entries()) {
      if (users.length > 1) {
        console.log(`🔍 Found ${users.length} users with email: ${email}`);
        
        // Sort users by data completeness score
        const scoredUsers = users.map(user => ({
          ...user,
          score: calculateUserDataScore(user)
        })).sort((a, b) => b.score - a.score);

        const bestUser = scoredUsers[0];
        const otherUsers = scoredUsers.slice(1);

        results.mismatchesFound++;
        results.summary.usersWithMultipleIds++;

        results.details.push({
          email,
          type: 'multiple_user_ids',
          severity: 'high',
          bestUser: {
            id: bestUser.id,
            score: bestUser.score,
            niches: bestUser.niches,
            onboarding_completed: bestUser.onboarding_completed,
            subscription_status: bestUser.subscription_status,
            created_at: bestUser.created_at
          },
          duplicateUsers: otherUsers.map(u => ({
            id: u.id,
            score: u.score,
            niches: u.niches,
            onboarding_completed: u.onboarding_completed,
            subscription_status: u.subscription_status,
            created_at: u.created_at
          })),
          recommendation: 'Run fix-user-id-mismatches endpoint to merge and clean up'
        });
      }
    }

    // Check for other potential issues
    allUsers.forEach(user => {
      const issues = [];
      
      if (!user.niches || user.niches.length === 0) {
        issues.push('no_niches');
        results.summary.usersWithNoNiches++;
      }
      
      if (!user.onboarding_completed) {
        issues.push('incomplete_onboarding');
        results.summary.usersWithIncompleteData++;
      }
      
      if (user.subscription_status !== 'active' && user.subscription_status !== 'trialing') {
        issues.push('inactive_subscription');
        results.summary.usersWithInactiveSubscriptions++;
      }
      
      if (issues.length > 0) {
        results.potentialIssues++;
        results.details.push({
          email: user.email,
          userId: user.id,
          type: 'data_quality_issues',
          severity: 'medium',
          issues,
          userData: {
            niches: user.niches,
            onboarding_completed: user.onboarding_completed,
            subscription_status: user.subscription_status,
            subscription_tier: user.subscription_tier,
            created_at: user.created_at
          }
        });
      }
    });

    console.log('📊 Monitoring results:', {
      totalUsers: results.totalUsers,
      mismatchesFound: results.mismatchesFound,
      potentialIssues: results.potentialIssues,
      summary: results.summary
    });

    return NextResponse.json({
      success: true,
      message: 'User ID mismatch monitoring completed',
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error('❌ Error in monitor-user-mismatches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to calculate user data completeness score
function calculateUserDataScore(user: any): number {
  let score = 0;
  
  if (user.niches && user.niches.length > 0) score += 10;
  if (user.onboarding_completed) score += 5;
  if (user.subscription_status === 'active') score += 3;
  if (user.stripe_customer_id) score += 2;
  if (user.email) score += 1;
  
  return score;
} 