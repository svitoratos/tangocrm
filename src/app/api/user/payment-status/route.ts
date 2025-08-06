import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/admin-config'

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = sessionClaims?.email as string
    const isAdmin = isAdminEmail(userEmail)

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // If user not found, check if they're admin
    if (!user) {
      return NextResponse.json({
        hasCompletedOnboarding: isAdmin,
        hasActiveSubscription: isAdmin,
        subscriptionStatus: isAdmin ? 'active' : 'inactive',
        subscriptionTier: isAdmin ? 'admin' : 'free',
        primaryNiche: isAdmin ? 'creator' : null,
        niches: isAdmin ? ['creator', 'coach', 'podcaster', 'freelancer'] : []
      })
    }

    // Payment integration removed - all users have access for now
    const hasActiveSubscription = true

    return NextResponse.json({
      hasCompletedOnboarding: isAdmin || user.onboarding_completed === true,
      hasActiveSubscription,
      subscriptionStatus: isAdmin ? 'active' : (user.subscription_status || 'inactive'),
      subscriptionTier: isAdmin ? 'admin' : (user.subscription_tier || 'free'),
      primaryNiche: user.primary_niche || 'creator',
      niches: user.niches || [user.primary_niche || 'creator']
    })
  } catch (error) {
    console.error('❌ Payment status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 