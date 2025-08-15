import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/admin-config'
import { stripe } from '@/lib/stripe'

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const cacheMap = new Map<string, { data: any; expiresAt: number }>();

function checkRateLimit(userId: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new rate limit entry
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false; // Rate limit exceeded
  }
  
  userLimit.count++;
  return true;
}

// Function to sync user's niches with actual Stripe subscriptions
async function syncUserNichesWithStripe(userId: string, stripeCustomerId: string): Promise<string[]> {
  try {
    console.log('🔧 Syncing user niches with Stripe subscriptions:', { userId, stripeCustomerId });
    
    // Get all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 100
    });
    
    console.log('🔧 Found active Stripe subscriptions:', subscriptions.data.length);
    
    // Map price IDs to niches
    const priceToNiche = {
      // Initial signup prices
      'price_1Rt8u9IvVfTNGbwuoAxHpYSj': 'creator',
      'price_1Rt8u9IvVfTNGbwug424qIjh': 'creator',
      'price_1Rt8u9IvVfTNGbwu0UI52sRR': 'coach',
      'price_1Rt8u9IvVfTNGbwuH88MMC8I': 'coach',
      'price_1Rt8uAIvVfTNGbwuiwPUarlw': 'podcaster',
      'price_1Rt8uAIvVfTNGbwu9nXGrotw': 'podcaster',
      'price_1Rt8uAIvVfTNGbwupN9yBl9U': 'freelancer',
      'price_1Rt8uBIvVfTNGbwuWxLrbFPu': 'freelancer',
      // Niche upgrade prices
      'price_1RqIA2IvVfTNGbwujqF5AXfU': 'creator',
      'price_1RqIAoIvVfTNGbwuXswPztfk': 'creator',
      'price_1RjmO3IvVfTNGbwuU9KTk44N': 'coach',
      'price_1RkCcMIvVfTNGbwuHONiyPQ7': 'coach',
      'price_1RqII9IvVfTNGbwuhApqysHX': 'podcaster',
      'price_1RqIIXIvVfTNGbwu8EMGv4OG': 'podcaster',
      'price_1RqIK7IvVfTNGbwuAiFKM7is': 'freelancer',
      'price_1RqIKNIvVfTNGbwuHONiyPQ7': 'freelancer'
    };
    
    const activeNiches: string[] = [];
    
    // Extract niches from active subscriptions
    for (const subscription of subscriptions.data) {
      for (const item of subscription.items.data) {
        const niche = priceToNiche[item.price.id as keyof typeof priceToNiche];
        if (niche && !activeNiches.includes(niche)) {
          activeNiches.push(niche);
          console.log('🔧 Found active niche:', niche, 'from price:', item.price.id);
        }
      }
    }
    
    console.log('🔧 Active niches from Stripe:', activeNiches);
    
    // CRITICAL FIX: Get current database niches and merge with Stripe niches
    const { data: currentUser } = await supabase
      .from('users')
      .select('niches, primary_niche')
      .eq('id', userId)
      .single();
    
    const databaseNiches = currentUser?.niches || [currentUser?.primary_niche || 'creator'];
    console.log('🔧 Current database niches:', databaseNiches);
    
    // Merge Stripe niches with database niches to prevent loss
    const mergedNiches = [...new Set([...databaseNiches, ...activeNiches])];
    console.log('🔧 Merged niches (database + Stripe):', mergedNiches);
    
    // Update the database with the merged niches
    if (mergedNiches.length > 0) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          niches: mergedNiches,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('❌ Error updating user niches in database:', updateError);
      } else {
        console.log('✅ Updated user niches in database (merged):', mergedNiches);
      }
    }
    
    // Return the merged niches to ensure no loss
    return mergedNiches;
    
  } catch (error) {
    console.error('❌ Error syncing user niches with Stripe:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth()
    
    if (!userId) {
      console.error('❌ No userId in auth');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = sessionClaims?.email as string
    const isAdmin = isAdminEmail(userEmail)

    // Check rate limit (more permissive for admin users)
    const rateLimit = isAdmin ? 200 : 100; // Admin users get higher rate limit
    if (!checkRateLimit(userId, rateLimit, 60000)) {
      console.warn('⚠️ Rate limit exceeded for user:', userId, { isAdmin, rateLimit });
      return NextResponse.json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: 60,
        isAdmin,
        rateLimit
      }, { status: 429 });
    }

    console.log('🔧 Checking payment status for user:', userId);

    console.log('🔧 User details:', { userId, userEmail, isAdmin });

    // Test Supabase connection
    try {
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError);
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
      } else {
        console.log('✅ Supabase connection test successful');
      }
    } catch (connectionError) {
      console.error('❌ Supabase connection error:', connectionError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ Database error:', error);
      if (error.code === 'PGRST116') {
        console.log('🔧 User not found in database, checking if admin');
        // User not found, check if they're admin
        if (isAdmin) {
          const adminResponse = {
            hasCompletedOnboarding: true,
            hasActiveSubscription: true,
            subscriptionStatus: 'active',
            subscriptionTier: 'admin',
            primaryNiche: 'creator',
            niches: ['creator', 'coach', 'podcaster', 'freelancer']
          };
          console.log('✅ Admin user response:', adminResponse);
          return NextResponse.json(adminResponse);
        } else {
          const newUserResponse = {
            hasCompletedOnboarding: false,
            hasActiveSubscription: false,
            subscriptionStatus: 'inactive',
            subscriptionTier: 'free',
            primaryNiche: null,
            niches: []
          };
          console.log('✅ New user response:', newUserResponse);
          return NextResponse.json(newUserResponse);
        }
      } else {
        console.error('❌ Non-PGRST116 database error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }
    }

    console.log('🔧 User found in database:', { 
      id: user.id, 
      email: user.email, 
      subscription_status: user.subscription_status,
      niches: user.niches 
    });

    // CRITICAL FIX: Sync user's niches with actual Stripe subscriptions
    let finalNiches: string[] = [];
    
    if (isAdmin) {
      // Admin users get access to all niches
      finalNiches = ['creator', 'coach', 'podcaster', 'freelancer'];
      console.log('🔧 Admin user - granting access to all niches');
    } else if (user.stripe_customer_id) {
      console.log('🔧 Syncing user niches with active Stripe subscriptions...');
      const syncedNiches = await syncUserNichesWithStripe(user.id, user.stripe_customer_id);
      
      if (syncedNiches.length > 0) {
        finalNiches = syncedNiches;
        console.log('✅ Using synced niches from active Stripe subscriptions:', finalNiches);
      } else {
        console.log('⚠️ No active subscriptions found in Stripe - using database niches');
        // SAFETY: Use database niches if Stripe sync fails or returns empty
        finalNiches = user.niches || [user.primary_niche || 'creator'];
        
        if (finalNiches.length > 0) {
          console.log('✅ Using database niches as fallback:', finalNiches);
        } else {
          console.error('❌ CRITICAL: No niches found in Stripe OR database');
          console.error('❌ User has no access to any business types');
        }
      }
    } else {
      console.log('⚠️ No Stripe customer ID found - using database niches');
      finalNiches = user.niches || [user.primary_niche || 'creator'];
      
      if (finalNiches.length > 0) {
        console.log('✅ Using database niches:', finalNiches);
      } else {
        console.warn('⚠️ User has no niches in database - this could indicate an onboarding issue');
      }
    }

    // Check subscription status
    const hasActiveSubscription = isAdmin || 
      user.subscription_status === 'active' || 
      user.subscription_status === 'trialing' || 
      user.subscription_status === 'past_due'

    const response = {
      hasCompletedOnboarding: isAdmin || user.onboarding_completed === true,
      hasActiveSubscription,
      subscriptionStatus: isAdmin ? 'active' : (user.subscription_status || 'inactive'),
      subscriptionTier: isAdmin ? 'admin' : (user.subscription_tier || 'free'),
      primaryNiche: user.primary_niche || 'creator',
      niches: finalNiches // Use synced niches instead of raw database niches
    };

    console.log('✅ Payment status response:', response);
    // Create response with cache headers to reduce server load
    const jsonResponse = NextResponse.json(response);
    jsonResponse.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    
    return jsonResponse;
  } catch (error) {
    console.error('❌ Payment status error:', error)
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 