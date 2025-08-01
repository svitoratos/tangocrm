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

    // Test 1: Check if we can connect to the database
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (connectionError) {
      console.error('Database connection error:', connectionError);
      return NextResponse.json(
        { error: 'Database connection failed', details: connectionError.message },
        { status: 500 }
      );
    }

    // Test 2: Check if calendar_events table exists
    const { data: tableTest, error: tableError } = await supabase
      .from('calendar_events')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Calendar events table error:', tableError);
      return NextResponse.json(
        { error: 'Calendar events table not found or inaccessible', details: tableError.message },
        { status: 500 }
      );
    }

    // Test 3: Try to get table schema (simplified)
    let schemaTest = null;
    try {
      const { data: schemaData, error: schemaError } = await supabase
        .rpc('get_table_columns', { table_name: 'calendar_events' });
      schemaTest = schemaData;
    } catch (schemaError) {
      schemaTest = 'Schema query not supported';
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      calendarEventsTableExists: true,
      schema: schemaTest || 'Schema query not available'
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Test failed', details: errorMessage },
      { status: 500 }
    );
  }
} 