import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

// GET /api/journal-entries
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // SECURITY FIX: Use authenticated user's ID directly - never override with hardcoded values
    const correctUserId = userId;
    console.log('Journal GET - Using authenticated user ID:', correctUserId);
    
    // Get niche filter from query parameters
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');
    
    console.log('Journal GET - Building query for user:', correctUserId, 'niche:', niche);
    
    let query = supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', correctUserId);
    
    // Filter by niche if provided
    if (niche) {
      console.log('Journal GET - Adding niche filter for:', niche);
      // Use the correct Supabase array containment syntax
      query = query.contains('tags', [niche]);
      console.log('Journal GET - Query after niche filter:', query);
    }
    
    console.log('Journal GET - Executing query...');
    const { data: entries, error } = await query.order('created_at', { ascending: false });
    console.log('Journal GET - Query result:', { entriesCount: entries?.length || 0, error: error?.message });
    
    if (entries && entries.length > 0) {
      console.log('Journal GET - Sample entry tags:', entries[0].tags);
    }

    if (error) {
      console.error('Error fetching journal entries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch journal entries' },
        { status: 500 }
      );
    }

    return NextResponse.json(entries || []);
  } catch (error) {
    console.error('Error in journal entries API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/journal-entries
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
    const { title, content, mood, tags, niche } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Get the correct user_id for database insertion (same logic as other APIs)
    let correctUserId = userId;
    try {
      // Try to find existing user by email
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', 'stevenvitoratos@getbondlyapp.com')
        .single();
      
      if (existingUser?.id) {
        correctUserId = existingUser.id;
        console.log('Journal POST - Using existing user ID for insertion:', correctUserId);
      } else {
        console.log('Journal POST - No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('Journal POST - Error finding existing user, using Clerk ID:', correctUserId);
    }
    
    // Ensure niche is included in tags array for proper filtering
    const entryTags = tags || [];
    if (niche && !entryTags.includes(niche)) {
      entryTags.push(niche);
    }
    
    console.log('📝 Journal POST - Final tags array:', entryTags);
    console.log('📝 Journal POST - Inserting with user_id:', correctUserId);
    
    const { data: entry, error } = await supabaseAdmin
      .from('journal_entries')
      .insert({
        user_id: correctUserId,
        title,
        content,
        mood,
        tags: entryTags
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating journal entry:', error);
      return NextResponse.json(
        { error: 'Failed to create journal entry' },
        { status: 500 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error in journal entries API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
