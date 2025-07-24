import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Utility function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: opportunityId } = await params;
    if (!isValidUUID(opportunityId)) {
      return NextResponse.json({ error: 'Invalid opportunity ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    console.log('🔍 API: Fetching activities for opportunity:', opportunityId);
    console.log('🔍 API: Limit parameter:', limit);

    const query = supabaseAdmin
      .from('opportunity_activities')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false });

    // Apply limit if specified
    if (limit) {
      query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('🔍 API: Successfully fetched activities:', data?.length || 0);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/opportunities/[id]/activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: opportunityId } = await params;
    if (!isValidUUID(opportunityId)) {
      return NextResponse.json({ error: 'Invalid opportunity ID' }, { status: 400 });
    }

    const body = await request.json();
    const { type, description, metadata } = body;

    // Validate required fields
    if (!type || !description) {
      return NextResponse.json({ error: 'Type and description are required' }, { status: 400 });
    }

    console.log('🔍 API: Creating activity for opportunity:', opportunityId);
    console.log('🔍 API: Activity data:', { type, description, metadata });

    // Create new activity log
    const { data: activity, error } = await supabaseAdmin
      .from('opportunity_activities')
      .insert({
        opportunity_id: opportunityId,
        user_id: userId,
        type,
        description,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      
      // Check if it's a table doesn't exist error
      if (error.message?.includes('relation "opportunity_activities" does not exist')) {
        return NextResponse.json(
          { error: 'Activity tracking not available yet. Please run the database migration first.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ error: `Failed to create activity: ${error.message}` }, { status: 500 });
    }

    console.log('🔍 API: Successfully created activity:', activity);
    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error in POST /api/opportunities/[id]/activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 