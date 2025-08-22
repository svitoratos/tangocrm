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
    console.log('=== JOURNAL ENTRIES GET API DEBUG START ===');
    console.log('Journal GET - Full request URL:', request.url);
    
    const { userId } = await auth();
    
    if (!userId) {
      console.log('Journal GET - Unauthorized - no userId');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use authenticated user ID directly - no override needed
    const correctUserId = userId;
    
    console.log('🔍 Journal GET - Raw userId from auth():', userId);
    console.log('🔍 Journal GET - Using correctUserId:', correctUserId);
    console.log('🔍 Journal GET - Types:', typeof userId, typeof correctUserId);
    
    // Get niche filter from query parameters
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');
    
    console.log('Journal GET - Building query for user:', correctUserId, 'niche:', niche);
    console.log('Journal GET - All search params:', Object.fromEntries(searchParams.entries()));
    
    let query = supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', correctUserId);
    
    // Filter by niche using tags array (since niche column doesn't exist yet)
    if (niche) {
      console.log('Journal GET - Adding niche filter for:', niche);
      query = query.contains('tags', [niche]);
      console.log('Journal GET - Query after niche filter:', query);
    } else {
      console.log('Journal GET - No niche parameter provided, will return all entries for user');
    }
    
    console.log('Journal GET - Executing query...');
    const { data: entries, error } = await query.order('created_at', { ascending: false });
    console.log('Journal GET - Query result:', { entriesCount: entries?.length || 0, error: error?.message });
    
    if (entries && entries.length > 0) {
      console.log('Journal GET - Sample entry tags:', entries[0].tags);
      console.log('Journal GET - Sample entry user_id:', entries[0].user_id);
    } else {
      console.log('Journal GET - No entries found. Let me check all entries for this user...');
      // Debug: Check all entries for this user without niche filter
      const { data: allEntries, error: allError } = await supabaseAdmin
        .from('journal_entries')
        .select('*')
        .eq('user_id', correctUserId);
      console.log('Journal GET - All entries for user (no niche filter):', allEntries?.length || 0);
      if (allEntries && allEntries.length > 0) {
        console.log('Journal GET - Sample entry without niche filter:', {
          id: allEntries[0].id,
          user_id: allEntries[0].user_id,
          tags: allEntries[0].tags,
          title: allEntries[0].title
        });
      }
    }
    
    console.log('=== JOURNAL ENTRIES GET API DEBUG END ===');

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

    // Use authenticated user ID directly - no override needed
    const correctUserId = userId;
    
    console.log('🔍 Journal POST - Raw userId from auth():', userId);
    console.log('🔍 Journal POST - Using correctUserId:', correctUserId);
    console.log('🔍 Journal POST - Types:', typeof userId, typeof correctUserId);
    
    // Ensure niche is included in tags array for proper filtering
    const entryTags = tags || [];
    if (niche && !entryTags.includes(niche)) {
      entryTags.push(niche);
    }
    
    console.log('📝 Journal POST - Final tags array:', entryTags);
    console.log('📝 Journal POST - About to insert with user_id:', correctUserId);
    console.log('📝 Journal POST - Data being inserted:', {
      user_id: correctUserId,
      title,
      content,
      mood,
      tags: entryTags,
      niche
    });
    
    const { data: entry, error } = await supabaseAdmin
      .from('journal_entries')
      .insert({
        user_id: correctUserId,
        title,
        content,
        mood,
        tags: entryTags
        // Remove niche column insert since it doesn't exist yet
      })
      .select()
      .single();
    
    console.log('📝 Journal POST - Database returned:', entry);
    console.log('📝 Journal POST - Insert error (if any):', error);

    if (error) {
      console.error('Error creating journal entry:', error);
      return NextResponse.json(
        { error: 'Failed to create journal entry' },
        { status: 500 }
      );
    }

    // TEMP FIX: Force the correct user_id in response and create corrected entry
    const correctedEntry = {
      ...entry,
      user_id: correctUserId, // Force correct user_id
      _debug: {
        originalUserId: entry?.user_id,
        rawUserId: userId,
        correctUserId: correctUserId,
        userIdTypes: { raw: typeof userId, correct: typeof correctUserId }
      }
    };
    
    console.log('📝 Journal POST - Returning corrected entry:', correctedEntry);
    return NextResponse.json(correctedEntry);
  } catch (error) {
    console.error('Error in journal entries API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
