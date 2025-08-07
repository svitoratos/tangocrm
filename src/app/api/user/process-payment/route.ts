import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { onboardingData } = await request.json();

    if (!onboardingData) {
      return NextResponse.json({ error: 'No onboarding data provided' }, { status: 400 });
    }

    // Update user with onboarding data and mark as paid
    const { data: user, error } = await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        primary_niche: onboardingData.selectedRoles[0] || 'creator',
        niches: onboardingData.selectedRoles,
        subscription_status: 'active',
        subscription_tier: 'core',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating user after payment:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    console.log('✅ User updated successfully after payment:', user.id);

    return NextResponse.json({ 
      success: true, 
      user: user 
    });

  } catch (error) {
    console.error('❌ Error processing payment:', error);
    return NextResponse.json({ 
      error: 'Failed to process payment' 
    }, { status: 500 });
  }
} 