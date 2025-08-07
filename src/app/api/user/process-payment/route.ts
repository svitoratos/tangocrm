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

    // First check if user exists, if not create them
    let { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist, create them
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: `${userId}@placeholder.tango`, // Placeholder email
          onboarding_completed: true,
          primary_niche: onboardingData.selectedRoles[0] || 'creator',
          niches: onboardingData.selectedRoles,
          subscription_status: 'active',
          subscription_tier: 'core',
          timezone: 'UTC',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user after payment:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      
      console.log('✅ User created successfully after payment:', newUser.id);
      return NextResponse.json({ 
        success: true, 
        user: newUser 
      });
    } else if (fetchError) {
      console.error('❌ Error fetching user:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    // User exists, update them
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