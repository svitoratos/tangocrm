import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// POST /api/tasks
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
    
    console.log('Received task creation request:', body);
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Get the correct user ID from the database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'stevenvitoratos@getbondlyapp.com')
      .single();

    if (userError) {
      console.error('Error finding user:', userError);
      return NextResponse.json(
        { error: 'User not found', details: userError.message },
        { status: 500 }
      );
    }

    console.log('Found user ID:', userData.id);
    
    // Try to create a simple task with only basic columns
    const taskData = {
      user_id: userData.id,
      title: body.title,
      description: body.description || ''
      // Removed all other fields to test basic functionality
    };
    
    console.log('Attempting to insert task data:', taskData);
    
    const { data: newTask, error } = await supabase
      .from('content_items')
      .insert(taskData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json(
        { error: 'Failed to create task', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create task', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET /api/tasks
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: tasks, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('user_id', userId)
      .eq('content_type', 'task')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(tasks || []);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
} 