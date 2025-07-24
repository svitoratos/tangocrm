import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  deadline?: string;
  status: string;
  category: string;
  niche: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// Helper function to get user ID from request
function getUserId(request: NextRequest): string {
  // TODO: Get user ID from authentication (Clerk, etc.)
  // For now, use a fallback user ID for testing
  return 'user_2zmMw9vD4wiYXnUnGe7sCiS3F11';
}

// GET /api/goals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');
    const userId = getUserId(request);
    
    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (niche) {
      query = query.eq('niche', niche);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch goals' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

// POST /api/goals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserId(request);
    
    const newGoal = {
      user_id: userId,
      title: body.title || 'New Goal',
      description: body.description || null,
      target_value: body.target_value || null,
      current_value: body.current_value || 0,
      unit: body.unit || null,
      deadline: body.deadline || null,
      status: body.status || 'active',
      category: body.category || 'revenue',
      niche: body.niche || 'creator',
      tags: [] // Empty tags array since we're not using tags
    };
    
    const { data, error } = await supabase
      .from('goals')
      .insert(newGoal)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create goal' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}

// PUT /api/goals
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    const userId = getUserId(request);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only update their own goals
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = getUserId(request);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user can only delete their own goals
    
    if (error) {
      console.error('Supabase error:', error);
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
