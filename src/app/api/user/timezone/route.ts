import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

// Lazy initialization of Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const { createClient } = require('@supabase/supabase-js');
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Get supported timezones from Intl API
const getSupportedTimezones = (): string[] => {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    // Fallback to common timezones if Intl.supportedValuesOf is not available
    return [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Australia/Sydney',
      'Pacific/Auckland'
    ];
  }
};

// Validate timezone against IANA list
const isValidTimezone = (timezone: string): boolean => {
  const supportedTimezones = getSupportedTimezones();
  return supportedTimezones.includes(timezone);
};

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user details from Clerk
    const user = await currentUser();
    
    // First, try to find the user by Clerk ID
    const supabase = getSupabaseClient();
    let { data, error } = await supabase
      .from('users')
      .select('timezone')
      .eq('id', userId)
      .single();

    // If not found, create the user with Clerk ID
    if (error && error.code === 'PGRST116') {
      try {
        // Use a unique placeholder email if no email is available
        const email = user?.emailAddresses?.[0]?.emailAddress || `${userId}@placeholder.tango`;
        
        const { data: userData, error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: email,
            timezone: 'UTC'
          })
          .select('timezone')
          .single();

        if (createError) {
          // If it's a duplicate key error, try to fetch the existing user
          if (createError.code === '23505') {
            const { data: existingUser, error: fetchError } = await supabase
              .from('users')
              .select('timezone')
              .eq('id', userId)
              .single();
            
            if (!fetchError && existingUser) {
              data = existingUser;
              error = null;
            } else {
              console.error('Error fetching existing user:', fetchError);
              return NextResponse.json(
                { error: 'Failed to fetch existing user' },
                { status: 500 }
              );
            }
          } else {
            console.error('Error creating user:', createError);
            return NextResponse.json(
              { error: 'Failed to create user' },
              { status: 500 }
            );
          }
        } else {
          data = userData;
          error = null;
        }
      } catch (err) {
        console.error('Error in user creation:', err);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }
    }

    if (error) {
      console.error('Error fetching user timezone:', error);
      return NextResponse.json(
        { error: 'Failed to fetch timezone' },
        { status: 500 }
      );
    }

    return NextResponse.json({ timezone: data?.timezone || 'UTC' });
  } catch (error) {
    console.error('Error in GET /api/user/timezone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { timezone } = body;

    if (!timezone || typeof timezone !== 'string') {
      return NextResponse.json(
        { error: 'Timezone is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate timezone against IANA list
    if (!isValidTimezone(timezone)) {
      return NextResponse.json(
        { error: 'Invalid timezone' },
        { status: 400 }
      );
    }

    // Get user details from Clerk
    const user = await currentUser();

    // First, try to find the user by Clerk ID
    const supabase = getSupabaseClient();
    let { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    // If user doesn't exist, create them
    if (fetchError && fetchError.code === 'PGRST116') {
      try {
        // Use a unique placeholder email if no email is available
        const email = user?.emailAddresses?.[0]?.emailAddress || `${userId}@placeholder.tango`;
        
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: email,
            timezone: timezone
          });

        if (createError) {
          // If it's a duplicate key error, the user already exists, so we can proceed
          if (createError.code === '23505') {
            console.log('User already exists, proceeding with timezone update');
          } else {
            console.error('Error creating user:', createError);
            return NextResponse.json(
              { error: 'Failed to create user' },
              { status: 500 }
            );
          }
        }
      } catch (err) {
        console.error('Error in user creation:', err);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }
    } else if (fetchError) {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );
    }

    // Update user timezone
    const { error } = await supabase
      .from('users')
      .update({ timezone, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user timezone:', error);
      return NextResponse.json(
        { error: 'Failed to update timezone' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      timezone,
      message: 'Timezone updated successfully' 
    });
  } catch (error) {
    console.error('Error in POST /api/user/timezone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 