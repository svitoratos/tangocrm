import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: string;
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

// GET /api/journal-entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');
    const userId = getUserId(request);
    
    let query = supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // Filter by niche in tags since there's no niche column
    if (niche) {
      query = query.contains('tags', [niche]);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch journal entries' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

// POST /api/journal-entries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserId(request);
    
    // Add niche to tags array since there's no niche column
    const tags = body.niche ? [body.niche] : [];
    
    const newEntry = {
      user_id: userId,
      title: body.title || 'Journal Entry',
      content: body.content || '',
      mood: body.mood || null,
      tags: tags // Store niche in tags for filtering
    };
    
    const { data, error } = await supabase
      .from('journal_entries')
      .insert(newEntry)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create journal entry' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}

// PUT /api/journal-entries
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    const userId = getUserId(request);
    
    // Handle niche by adding it to tags
    const tags = updateData.niche ? [updateData.niche] : [];
    
    // Remove niche from updateData since it doesn't exist in the database
    const { niche, ...cleanUpdateData } = updateData;
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

// DELETE /api/journal-entries
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = getUserId(request);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Journal entry ID is required' },
        { status: 400 }
      );
    }
    
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
