import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/goals/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the correct user_id for database query (same logic as main route)
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
        console.log('Goals GET [id] - Using existing user ID for query:', correctUserId);
      } else {
        console.log('Goals GET [id] - No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('Goals GET [id] - Error finding existing user, using Clerk ID:', correctUserId);
    }

    const { data: goal, error } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', correctUserId)
      .single();

    if (error) {
      console.error('Error fetching goal:', error);
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error in goal API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/goals/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Get the correct user_id for database query (same logic as main route)
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
        console.log('Goals PUT [id] - Using existing user ID for query:', correctUserId);
      } else {
        console.log('Goals PUT [id] - No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('Goals PUT [id] - Error finding existing user, using Clerk ID:', correctUserId);
    }

    const { data: goal, error } = await supabaseAdmin
      .from('goals')
      .update(body)
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

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error in goal API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/goals/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the correct user_id for database query (same logic as main route)
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
        console.log('Goals DELETE [id] - Using existing user ID for query:', correctUserId);
      } else {
        console.log('Goals DELETE [id] - No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('Goals DELETE [id] - Error finding existing user, using Clerk ID:', correctUserId);
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
    console.error('Error in goal API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
