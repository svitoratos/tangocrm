import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper function to get user ID from request
function getUserId(request: NextRequest): string {
  // TODO: Get user ID from authentication (Clerk, etc.)
  // For now, use a fallback user ID for testing
  return 'user_2zmMw9vD4wiYXnUnGe7sCiS3F11';
}

// PUT /api/journal-entries/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const userId = getUserId(request);
    
    // Handle niche by adding it to tags
    let tags = body.tags || [];
    if (body.niche && !tags.includes(body.niche)) {
      tags.push(body.niche);
    }
    
    // Remove niche from updateData since it doesn't exist in the database
    const { niche, ...cleanUpdateData } = body;
    cleanUpdateData.tags = tags;
    
    const { data, error } = await supabase
      .from('journal_entries')
      .update(cleanUpdateData)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only update their own entries
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update journal entry' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to update journal entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/journal-entries/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserId(request);
    
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user can only delete their own entries
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete journal entry' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
} 