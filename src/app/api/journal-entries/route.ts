import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const niche = searchParams.get('niche');
    const offset = (page - 1) * limit;

    // Get journal entries (temporarily without niche filtering)
    const { data: entries, error: entriesError } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (entriesError) {
      console.error('Error fetching journal entries:', entriesError);
      return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
    }

    // Get total count (temporarily without niche filtering)
    const { count, error: countError } = await supabaseAdmin
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting journal entries:', countError);
      return NextResponse.json({ error: 'Failed to count journal entries' }, { status: 500 });
    }

    return NextResponse.json({
      entries: entries || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, mood, tags, niche } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const { data: newEntry, error } = await supabaseAdmin
      .from('journal_entries')
      .insert({
        user_id: userId,
        title,
        content,
        mood: mood || null,
        tags: tags || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating journal entry:', error);
      return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 });
    }

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
