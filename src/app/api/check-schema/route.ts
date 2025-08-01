import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Try to get a sample record to see what columns actually exist
    const { data: sampleData, error: sampleError } = await supabase
      .from('content_items')
      .select('*')
      .limit(1);

    // Try to insert a minimal record to see what columns are required
    const { data: testInsert, error: testError } = await supabase
      .from('content_items')
      .insert({
        user_id: userId,
        title: 'Test Record',
        description: 'Test'
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      sampleData: sampleData,
      sampleError: sampleError,
      testInsert: testInsert,
      testError: testError
    });

  } catch (error) {
    console.error('Schema check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Schema check failed', details: errorMessage },
      { status: 500 }
    );
  }
} 