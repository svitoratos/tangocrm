import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Test task creation - User ID:', userId);

    // Try to create a simple test task
    const testTaskData = {
      user_id: userId,
      title: 'Test Task',
      description: 'This is a test task',
      content_type: 'task',
      status: 'pending',
      stage: 'planning',
      notes: 'Test notes',
      tags: ['test']
    };

    console.log('Attempting to insert test task:', testTaskData);

    const { data: newTask, error } = await supabase
      .from('content_items')
      .insert(testTaskData)
      .select()
      .single();

    if (error) {
      console.error('Test task creation failed:', error);
      return NextResponse.json(
        { error: 'Test task creation failed', details: error.message },
        { status: 500 }
      );
    }

    console.log('Test task created successfully:', newTask);

    return NextResponse.json({
      success: true,
      message: 'Test task created successfully',
      task: newTask
    });

  } catch (error) {
    console.error('Test task endpoint error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Test failed', details: errorMessage },
      { status: 500 }
    );
  }
} 