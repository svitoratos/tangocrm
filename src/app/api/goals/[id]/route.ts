import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');

    if (!niche) {
      return NextResponse.json({ error: 'Niche parameter is required' }, { status: 400 });
    }

    const { data: goal, error } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('niche', niche)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
      }
      console.error('Error fetching goal:', error);
      return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error in GET /api/goals/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      target_value,
      current_value,
      unit,
      deadline,
      status,
      category,
      tags,
      niche
    } = body;

    if (!title || !category || !niche) {
      return NextResponse.json({ 
        error: 'Title, category, and niche are required' 
      }, { status: 400 });
    }

    const { data: updatedGoal, error } = await supabaseAdmin
      .from('goals')
      .update({
        title,
        description: description || null,
        target_value: target_value ? parseFloat(target_value) : null,
        current_value: current_value ? parseFloat(current_value) : 0,
        unit: unit || null,
        deadline: deadline || null,
        status: status || 'active',
        category,
        niche,
        tags: tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('niche', niche)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
      }
      console.error('Error updating goal:', error);
      return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
    }

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error('Error in PUT /api/goals/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');

    if (!niche) {
      return NextResponse.json({ error: 'Niche parameter is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('niche', niche);

    if (error) {
      console.error('Error deleting goal:', error);
      return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/goals/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
