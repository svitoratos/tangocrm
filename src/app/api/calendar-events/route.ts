import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { DateUtils } from '@/lib/date-utils';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  type: 'meeting' | 'content_creation' | 'deadline' | 'reminder' | 'other';
  color?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  niche: string;
  client_id?: string;
  deal_id?: string;
  location?: string;
  meeting_url?: string;
  notes?: string;
  tags?: string[];
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
    
    // Create event in database
    const { data: newEvent, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: userId,
        title: body.title,
        description: body.description,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        type: body.type || 'meeting',
        color: body.color || 'blue',
        status: body.status || 'scheduled',
        niche: body.niche || 'creator',
        client_id: body.client_id,
        deal_id: body.deal_id,
        location: body.location,
        meeting_url: body.meeting_url,
        notes: body.notes,
        tags: body.tags || []
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating calendar event:', error);
      return NextResponse.json(
        { error: 'Failed to create calendar event' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
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