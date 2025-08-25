import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const niche = searchParams.get('niche');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: goals, error: goalsError } = await query
      .range(offset, offset + limit - 1);

    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
      return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
    }

    // Get total count (temporarily without niche filtering)
    let countQuery = supabaseAdmin
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    if (category) {
      countQuery = countQuery.eq('category', category);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting goals:', countError);
      return NextResponse.json({ error: 'Failed to count goals' }, { status: 500 });
    }

    return NextResponse.json({
      goals: goals || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
      niche, 
      tags 
    } = body;

    if (!title || !category) {
      return NextResponse.json({ 
        error: 'Title and category are required' 
      }, { status: 400 });
    }

    const { data: newGoal, error } = await supabaseAdmin
      .from('goals')
      .insert({
        user_id: userId,
        title,
        description: description || null,
        target_value: target_value || null,
        current_value: current_value || 0,
        unit: unit || null,
        deadline: deadline || null,
        status: status || 'active',
        category,
        tags: tags || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
    }

    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
