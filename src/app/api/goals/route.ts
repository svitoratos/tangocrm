import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

// GET /api/goals
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // SECURITY FIX: Use authenticated user's ID directly - never override with hardcoded values
    const correctUserId = userId;
    console.log('Goals GET - Using authenticated user ID:', correctUserId);
    
    // Get niche filter from query parameters
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');
    
    let query = supabaseAdmin
      .from('goals')
      .select('*')
      .eq('user_id', correctUserId);
    
    // Filter by niche if provided
    if (niche) {
      query = query.eq('niche', niche);
    }
    
    const { data: goals, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch goals' },
        { status: 500 }
      );
    }

    return NextResponse.json(goals || []);
  } catch (error) {
    console.error('Error in goals API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/goals
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
    const { title, description, deadline, status = 'active', category = 'general', niche = 'creator' } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Get the correct user_id for database insertion (same logic as other APIs)
    let correctUserId = userId;
    try {
      // Try to find existing user by email
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', 'stevenvitoratos@gmail.com')
        .single();
      
      if (existingUser?.id) {
        correctUserId = existingUser.id;
        console.log('Goals POST - Using existing user ID for insertion:', correctUserId);
      } else {
        console.log('Goals POST - No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('Goals POST - Error finding existing user, using Clerk ID:', correctUserId);
    }
    
    const { data: goal, error } = await supabaseAdmin
      .from('goals')
      .insert({
        user_id: correctUserId,
        title,
        description,
        deadline,
        status,
        category,
        niche
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to create goal', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error in goals API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
