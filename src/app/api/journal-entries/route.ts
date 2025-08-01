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

    // Get the correct user_id for database query (same logic as other APIs)
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
        console.log('Journal GET - Using existing user ID for query:', correctUserId);
      } else {
        console.log('Journal GET - No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('Journal GET - Error finding existing user, using Clerk ID:', correctUserId);
    }
    
    const { data: entries, error } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', correctUserId)
      .order('created_at', { ascending: false });

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
    const { title, content, mood, tags } = body;

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
    
    const { data: entry, error } = await supabaseAdmin
      .from('journal_entries')
      .insert({
        user_id: correctUserId,
        title,
        content,
        mood,
        tags: tags || []
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

// PUT /api/journal-entries
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Journal entry ID is required' },
        { status: 400 }
      );
    }
    
    // Get the correct user_id for database query (same logic as other APIs)
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
        console.log('Journal PUT - Using existing user ID for query:', correctUserId);
      } else {
        console.log('Journal PUT - No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('Journal PUT - Error finding existing user, using Clerk ID:', correctUserId);
    }
    
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', correctUserId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating journal entry:', error);
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
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Journal entry ID is required' },
        { status: 400 }
      );
    }
    
    // Get the correct user_id for database query (same logic as other APIs)
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
        console.log('Journal DELETE - Using existing user ID for query:', correctUserId);
      } else {
        console.log('Journal DELETE - No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('Journal DELETE - Error finding existing user, using Clerk ID:', correctUserId);
    }
    
    const { error } = await supabaseAdmin
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', correctUserId);
    
    if (error) {
      console.error('Error deleting journal entry:', error);
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
