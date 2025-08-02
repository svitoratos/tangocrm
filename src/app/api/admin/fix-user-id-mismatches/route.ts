import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!dbUser || dbUser.email !== 'stevenvitoratos@getbondlyapp.com') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('🔧 Admin: Starting user ID mismatch detection and fix...');

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
      mismatchesFixed: 0,
      errors: 0,
      details: [] as any[]
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

        console.log('📊 User scores:', scoredUsers.map(u => ({
          id: u.id,
          score: u.score,
          niches: u.niches,
          onboarding_completed: u.onboarding_completed,
          subscription_status: u.subscription_status
        })));

        const bestUser = scoredUsers[0];
        const otherUsers = scoredUsers.slice(1);

        results.mismatchesFound++;

        // Merge all data into the best user
        let mergedData = { ...bestUser };
        
        for (const otherUser of otherUsers) {
          mergedData = mergeUserData(mergedData, otherUser);
        }

        console.log('🔧 Merged data:', {
          id: mergedData.id,
          niches: mergedData.niches,
          onboarding_completed: mergedData.onboarding_completed,
          subscription_status: mergedData.subscription_status
        });

        // Update the best user with merged data
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            ...mergedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', bestUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Error updating best user:', updateError);
          results.errors++;
          results.details.push({
            email,
            action: 'update_best_user',
            error: updateError.message
          });
          continue;
        }

        // Delete the other users
        for (const otherUser of otherUsers) {
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', otherUser.id);

          if (deleteError) {
            console.error('❌ Error deleting duplicate user:', deleteError);
            results.errors++;
            results.details.push({
              email,
              action: 'delete_duplicate',
              userId: otherUser.id,
              error: deleteError.message
            });
          }
        }

        results.mismatchesFixed++;
        results.details.push({
          email,
          action: 'merged_and_cleaned',
          bestUserId: bestUser.id,
          deletedUserIds: otherUsers.map(u => u.id),
          finalNiches: mergedData.niches,
          finalOnboardingCompleted: mergedData.onboarding_completed,
          finalSubscriptionStatus: mergedData.subscription_status
        });

        console.log(`✅ Fixed mismatch for ${email}`);
      }
    }

    console.log('🎉 User ID mismatch detection and fix completed');
    console.log('📊 Results:', results);

    return NextResponse.json({
      success: true,
      message: 'User ID mismatch detection and fix completed',
      results
    });

  } catch (error) {
    console.error('❌ Error in fix-user-id-mismatches:', error);
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

// Helper function to merge user data intelligently
function mergeUserData(existingUser: any, newData: any): any {
  const merged = { ...existingUser };
  
  // Merge niches
  if (newData.niches && newData.niches.length > 0) {
    const existingNiches = existingUser.niches || [];
    const newNiches = newData.niches;
    merged.niches = [...new Set([...existingNiches, ...newNiches])];
  }
  
  // Prefer completed onboarding
  if (newData.onboarding_completed && !existingUser.onboarding_completed) {
    merged.onboarding_completed = true;
  }
  
  // Prefer active subscription status
  if (newData.subscription_status === 'active' && existingUser.subscription_status !== 'active') {
    merged.subscription_status = 'active';
  }
  
  // Prefer core subscription tier
  if (newData.subscription_tier === 'core' && existingUser.subscription_tier !== 'core') {
    merged.subscription_tier = 'core';
  }
  
  // Prefer newer data for other fields
  if (newData.stripe_customer_id) merged.stripe_customer_id = newData.stripe_customer_id;
  if (newData.primary_niche) merged.primary_niche = newData.primary_niche;
  if (newData.email) merged.email = newData.email;
  if (newData.full_name) merged.full_name = newData.full_name;
  if (newData.avatar_url) merged.avatar_url = newData.avatar_url;
  
  return merged;
} 