import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin-config';

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = sessionClaims?.email as string;
    const isAdmin = isAdminEmail(userEmail);

    console.log('🔧 Force refreshing payment status for user:', userId);

    // Get fresh user data from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // If user not found, check if they're admin
    if (!user) {
      const adminResponse = {
        hasCompletedOnboarding: isAdmin,
        hasActiveSubscription: isAdmin,
        subscriptionStatus: isAdmin ? 'active' : 'inactive',
        subscriptionTier: isAdmin ? 'admin' : 'free',
        primaryNiche: isAdmin ? 'creator' : null,
        niches: isAdmin ? ['creator', 'coach', 'podcaster', 'freelancer'] : []
      };
      
      console.log('✅ Force refresh complete (admin user not in DB):', adminResponse);
      return NextResponse.json(adminResponse);
    }

    // Check subscription status
    const hasActiveSubscription = isAdmin || 
      user.subscription_status === 'active' || 
      user.subscription_status === 'trialing' || 
      user.subscription_status === 'past_due';

    const response = {
      hasCompletedOnboarding: isAdmin || user.onboarding_completed === true,
      hasActiveSubscription,
      subscriptionStatus: isAdmin ? 'active' : (user.subscription_status || 'inactive'),
      subscriptionTier: isAdmin ? 'admin' : (user.subscription_tier || 'free'),
      primaryNiche: user.primary_niche || 'creator',
      niches: user.niches || [user.primary_niche || 'creator'],
      stripeCustomerId: user.stripe_customer_id || null
    };

    console.log('✅ Force refresh complete:', response);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Force refresh payment status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 