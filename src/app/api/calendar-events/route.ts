import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { DateUtils } from '@/lib/date-utils';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: 'meeting' | 'content_creation' | 'deadline' | 'reminder' | 'other';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  client_id?: string;
  opportunity_id?: string;
  location?: string;
  all_day?: boolean;
  user_timezone?: string;
  created_at: string;
  updated_at: string;
}

// GET /api/calendar-events
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    
    // Build query
    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId);
    
    // Filter by niche if provided
    if (niche) {
      query = query.eq('niche', niche);
    }
    
    // Filter by date range if provided
    if (start && end) {
      const startDate = DateUtils.parseDate(start);
      const endDate = DateUtils.parseDate(end);
      
      if (startDate && endDate) {
        query = query
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString());
      }
    }
    
    const { data: events, error } = await query.order('start_time', { ascending: true });
    
    if (error) {
      console.error('Error fetching calendar events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch calendar events' },
        { status: 500 }
      );
    }
    
    // Return events (empty array if no events found)
    return NextResponse.json(events || []);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

// POST /api/calendar-events
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
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    if (!body.start_time || !body.end_time) {
      return NextResponse.json(
        { error: 'Start time and end time are required' },
        { status: 400 }
      );
    }
    
    // Validate dates
    const startDate = DateUtils.parseDate(body.start_time);
    const endDate = DateUtils.parseDate(body.end_time);
    
    if (!startDate) {
      return NextResponse.json(
        { error: 'Invalid start time' },
        { status: 400 }
      );
    }
    
    if (!endDate) {
      return NextResponse.json(
        { error: 'Invalid end time' },
        { status: 400 }
      );
    }
    
    // Validate date range
    if (!DateUtils.validateDateRange(startDate, endDate)) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }
    
    // Get user's timezone and correct user ID for proper date handling
    let userTimezone = 'UTC';
    let correctUserId = userId;
    try {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('timezone, id')
        .eq('id', userId)
        .single();

      if (userData?.timezone) {
        userTimezone = userData.timezone;
      }
      if (userData?.id) {
        correctUserId = userData.id;
      }
    } catch (error) {
      console.log('Could not find user by Clerk ID, trying to find by email...');
      // Try to find user by email as fallback
      try {
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('timezone, id')
          .eq('email', 'stevenvitoratos@getbondlyapp.com')
          .single();

        if (userData?.timezone) {
          userTimezone = userData.timezone;
        }
        if (userData?.id) {
          correctUserId = userData.id;
        }
      } catch (emailError) {
        console.log('Could not find user by email either, using default timezone UTC and original user ID');
        // Continue with default timezone and original user ID
      }
    }

    // Create event in database
    const { data: newEvent, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: correctUserId,
        title: body.title,
        description: body.description,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        event_type: body.type || 'meeting', // Changed from 'type' to 'event_type'
        status: body.status || 'scheduled',
        client_id: body.client_id,
        opportunity_id: body.deal_id, // Changed from 'deal_id' to 'opportunity_id'
        location: body.location,
        user_timezone: userTimezone
        // Removed: color, niche, notes, tags, meeting_url (not in schema)
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating calendar event:', error);
      return NextResponse.json(
        { error: 'Failed to create calendar event', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create calendar event', details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/calendar-events
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
        { error: 'Calendar event ID is required' },
        { status: 400 }
      );
    }
    
    // Validate dates if provided
    if (updateData.start_time || updateData.end_time) {
      const startDate = DateUtils.parseDate(updateData.start_time);
      const endDate = DateUtils.parseDate(updateData.end_time);
      
      if (startDate && endDate && !DateUtils.validateDateRange(startDate, endDate)) {
        return NextResponse.json(
          { error: 'End time must be after start time' },
          { status: 400 }
        );
      }
    }
    
    // Update event in database
    const { data: updatedEvent, error } = await supabase
      .from('calendar_events')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating calendar event:', error);
      return NextResponse.json(
        { error: 'Failed to update calendar event' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar-events
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Calendar event ID is required' },
        { status: 400 }
      );
    }
    
    // Delete event from database
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting calendar event:', error);
      return NextResponse.json(
        { error: 'Failed to delete calendar event' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
} 