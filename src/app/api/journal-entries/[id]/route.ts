import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');

    if (!niche) {
      return NextResponse.json({ error: 'Niche parameter is required' }, { status: 400 });
    }

    const { data: entry, error } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('niche', niche)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
      }
      console.error('Error fetching journal entry:', error);
      return NextResponse.json({ error: 'Failed to fetch journal entry' }, { status: 500 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, mood, tags, niche } = body;

    if (!title || !content || !niche) {
      return NextResponse.json({ error: 'Title, content, and niche are required' }, { status: 400 });
    }

    const { data: updatedEntry, error } = await supabaseAdmin
      .from('journal_entries')
      .update({
        title,
        content,
        mood: mood || null,
        tags: tags || [],
        niche,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('niche', niche)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
      }
      console.error('Error updating journal entry:', error);
      return NextResponse.json({ error: 'Failed to update journal entry' }, { status: 500 });
    }

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');

    if (!niche) {
      return NextResponse.json({ error: 'Niche parameter is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('niche', niche);

    if (error) {
      console.error('Error deleting journal entry:', error);
      return NextResponse.json({ error: 'Failed to delete journal entry' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
