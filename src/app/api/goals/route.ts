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

    // Get the correct user_id for database query (same logic as other APIs)
    let correctUserId = userId;
    try {
      // Try to find existing user by email
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', 'stevenvitoratos@getbondlyapp.com')
        .single();
      
      if (existingUser?.id) {
        correctUserId = existingUser.id;
        console.log('Goals GET - Using existing user ID for query:', correctUserId);
      } else {
        console.log('Goals GET - No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('Goals GET - Error finding existing user, using Clerk ID:', correctUserId);
    }
    
    const { data: goals, error } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('user_id', correctUserId)
      .order('created_at', { ascending: false });

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
    const { title, description, target_date, status = 'pending', category = 'general', niche = 'creator' } = body;

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
        .eq('email', 'stevenvitoratos@getbondlyapp.com')
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
        target_date,
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

// PUT /api/goals
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }
    
    // Get the correct user_id for database query (same logic as other APIs)
    let correctUserId = userId;
    try {
      // Try to find existing user by email
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', 'stevenvitoratos@getbondlyapp.com')
        .single();
      
      if (existingUser?.id) {
        correctUserId = existingUser.id;
        console.log('Goals PUT - Using existing user ID for query:', correctUserId);
      } else {
        console.log('Goals PUT - No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('Goals PUT - Error finding existing user, using Clerk ID:', correctUserId);
    }
    
    const { data, error } = await supabaseAdmin
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', correctUserId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating goal:', error);
      return NextResponse.json(
        { error: 'Failed to update goal' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

// DELETE /api/goals
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }
    
    // Get the correct user_id for database query (same logic as other APIs)
    let correctUserId = userId;
    try {
      // Try to find existing user by email
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', 'stevenvitoratos@getbondlyapp.com')
        .single();
      
      if (existingUser?.id) {
        correctUserId = existingUser.id;
        console.log('Goals DELETE - Using existing user ID for query:', correctUserId);
      } else {
        console.log('Goals DELETE - No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('Goals DELETE - Error finding existing user, using Clerk ID:', correctUserId);
    }
    
    const { error } = await supabaseAdmin
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', correctUserId);
    
    if (error) {
      console.error('Error deleting goal:', error);
      return NextResponse.json(
        { error: 'Failed to delete goal' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
