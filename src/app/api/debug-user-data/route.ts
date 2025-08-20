import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user info
    console.log('🔍 Current authenticated user ID:', userId);

    // Check all journal entries (no user filter)
    const { data: allEntries } = await supabaseAdmin
      .from('journal_entries')
      .select('id, user_id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    // Check all users
    const { data: allUsers } = await supabaseAdmin
      .from('users')
      .select('id, email, created_at')
      .limit(10);

    // Check entries for current user
    const { data: currentUserEntries } = await supabaseAdmin
      .from('journal_entries')
      .select('id, user_id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      currentUserId: userId,
      allUsers: allUsers || [],
      allEntries: allEntries || [],
      currentUserEntries: currentUserEntries || []
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}