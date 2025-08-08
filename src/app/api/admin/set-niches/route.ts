import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isAdminEmail } from '@/lib/admin-config';
import { supabase } from '@/lib/supabase';

const ALLOWED_NICHES = new Set(['creator', 'coach', 'podcaster', 'freelancer']);

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = sessionClaims?.email as string | undefined;
    if (!email || !isAdminEmail(email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetEmail, niches, primaryNiche } = await request.json();

    if (!targetEmail || !Array.isArray(niches) || niches.length === 0) {
      return NextResponse.json({ error: 'targetEmail and niches[] are required' }, { status: 400 });
    }

    // Validate niches
    const normalized = niches.map((n: string) => String(n).toLowerCase());
    for (const n of normalized) {
      if (!ALLOWED_NICHES.has(n)) {
        return NextResponse.json({ error: `Invalid niche: ${n}` }, { status: 400 });
      }
    }

    const uniqueNiches = Array.from(new Set(normalized));
    const finalPrimary = primaryNiche && ALLOWED_NICHES.has(String(primaryNiche).toLowerCase())
      ? String(primaryNiche).toLowerCase()
      : uniqueNiches[0];

    // Find user by email
    const { data: user, error: findErr } = await supabase
      .from('users')
      .select('id, niches, primary_niche')
      .eq('email', targetEmail)
      .single();

    if (findErr && findErr.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Database lookup failed', details: findErr.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: updated, error: updateErr } = await supabase
      .from('users')
      .update({
        niches: uniqueNiches,
        primary_niche: finalPrimary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: 'Update failed', details: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}