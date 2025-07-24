import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export interface Opportunity {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  description?: string;
  value: number;
  status: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';
  type: 'brand_deal' | 'sponsorship' | 'consulting' | 'coaching' | 'content_creation' | 'other';
  probability: number;
  expected_close_date?: string;
  actual_close_date?: string;
  follow_up_date?: string;
  discovery_call_date?: string;
  scheduled_date?: string;
  user_timezone: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    name: string;
    email?: string;
    company?: string;
  };
  niche: 'creator' | 'coach' | 'podcaster' | 'freelancer';
}

// GET /api/opportunities - Returns opportunities with timezone-aware dates
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
    const includeTimezone = searchParams.get('includeTimezone') === 'true';
    
    // Build query using the timezone-aware view
    let query = supabase
      .from('opportunities_with_timezone')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          company
        )
      `)
      .eq('user_id', userId);
    
    // Filter by niche if provided
    if (niche) {
      query = query.eq('niche', niche);
    }
    
    const { data: opportunitiesData, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching opportunities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch opportunities' },
        { status: 500 }
      );
    }
    
    // Transform opportunities data with timezone-aware dates
    const opportunities: Opportunity[] = (opportunitiesData || []).map(opportunity => ({
      id: opportunity.id,
      user_id: opportunity.user_id,
      client_id: opportunity.client_id,
      title: opportunity.title,
      description: opportunity.description,
      value: opportunity.value || 0,
      status: opportunity.status as 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost',
      type: opportunity.type as 'brand_deal' | 'sponsorship' | 'consulting' | 'coaching' | 'content_creation' | 'other' || 'other',
      probability: opportunity.probability || 0,
      expected_close_date: includeTimezone ? opportunity.expected_close_date_local : opportunity.expected_close_date,
      actual_close_date: includeTimezone ? opportunity.actual_close_date_local : opportunity.actual_close_date,
      follow_up_date: includeTimezone ? opportunity.follow_up_date_local : opportunity.follow_up_date,
      discovery_call_date: includeTimezone ? opportunity.discovery_call_date_local : opportunity.discovery_call_date,
      scheduled_date: includeTimezone ? opportunity.scheduled_date_local : opportunity.scheduled_date,
      user_timezone: opportunity.user_timezone,
      notes: opportunity.notes,
      tags: opportunity.tags || [],
      created_at: opportunity.created_at,
      updated_at: opportunity.updated_at,
      niche: opportunity.niche as 'creator' | 'coach' | 'podcaster' | 'freelancer',
      clients: opportunity.clients ? {
        id: opportunity.clients.id,
        name: opportunity.clients.name,
        email: opportunity.clients.email,
        company: opportunity.clients.company
      } : undefined
    }));
    
    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Error in GET /api/opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/opportunities - Creates opportunity with timezone-aware dates
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
    
    // Get user's timezone for proper date handling
    const { data: userData } = await supabase
      .from('users')
      .select('timezone')
      .eq('id', userId)
      .single();
    
    const userTimezone = userData?.timezone || 'UTC';
    
    // Convert dates to UTC for storage using the helper function
    let expectedCloseDate = body.expected_close_date;
    let actualCloseDate = body.actual_close_date;
    let followUpDate = body.follow_up_date;
    let discoveryCallDate = body.discovery_call_date;
    let scheduledDate = body.scheduled_date;
    
    // Helper function to convert date to UTC
    const convertToUTC = (dateString: string | null | undefined): string | null => {
      if (!dateString) return null;
      
      // If it's already an ISO string with timezone, return as-is
      if (dateString.includes('T') && (dateString.includes('Z') || dateString.includes('+'))) {
        return dateString;
      }
      
      // If it's a date-only string (YYYY-MM-DD), convert to UTC
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return `${dateString}T00:00:00.000Z`;
      }
      
      // Try to parse as a local date and convert to UTC
      try {
        const localDate = new Date(dateString);
        if (isNaN(localDate.getTime())) {
          throw new Error('Invalid date format');
        }
        
        // Convert from user's timezone to UTC
        const utcDate = new Date(localDate.toLocaleString('en-US', { timeZone: userTimezone }));
        return utcDate.toISOString();
      } catch (error) {
        console.error('Error converting date to UTC:', error);
        return null;
      }
    };
    
    expectedCloseDate = convertToUTC(expectedCloseDate);
    actualCloseDate = convertToUTC(actualCloseDate);
    followUpDate = convertToUTC(followUpDate);
    discoveryCallDate = convertToUTC(discoveryCallDate);
    scheduledDate = convertToUTC(scheduledDate);
    
    // Create opportunity in database with timezone information
    const { data: newOpportunity, error } = await supabase
      .from('opportunities')
      .insert({
        user_id: userId,
        client_id: body.client_id,
        title: body.title,
        description: body.description,
        value: body.value || 0,
        status: body.status || 'prospecting',
        stage: body.status || 'prospecting',
        type: body.type || 'other',
        niche: body.niche || 'creator',
        probability: body.probability || 0,
        expected_close_date: expectedCloseDate,
        actual_close_date: actualCloseDate,
        follow_up_date: followUpDate,
        discovery_call_date: discoveryCallDate,
        scheduled_date: scheduledDate,
        user_timezone: userTimezone,
        notes: body.notes,
        tags: body.tags || [],
        custom_fields: body.customFields || {}
      })
      .select(`
        *,
        clients (
          id,
          name,
          email,
          company
        )
      `)
      .single();
    
    if (error) {
      console.error('Error creating opportunity:', error);
      return NextResponse.json(
        { error: 'Failed to create opportunity' },
        { status: 500 }
      );
    }
    
    // Transform to opportunity format with timezone-aware dates
    const opportunity: Opportunity = {
      id: newOpportunity.id,
      user_id: newOpportunity.user_id,
      client_id: newOpportunity.client_id,
      title: newOpportunity.title,
      description: newOpportunity.description,
      value: newOpportunity.value || 0,
      status: newOpportunity.status as 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost',
      type: newOpportunity.type as 'brand_deal' | 'sponsorship' | 'consulting' | 'coaching' | 'content_creation' | 'other' || 'other',
      probability: newOpportunity.probability || 0,
      expected_close_date: newOpportunity.expected_close_date,
      actual_close_date: newOpportunity.actual_close_date,
      follow_up_date: newOpportunity.follow_up_date,
      discovery_call_date: newOpportunity.discovery_call_date,
      scheduled_date: newOpportunity.scheduled_date,
      user_timezone: newOpportunity.user_timezone,
      notes: newOpportunity.notes,
      tags: newOpportunity.tags || [],
      created_at: newOpportunity.created_at,
      updated_at: newOpportunity.updated_at,
      niche: newOpportunity.niche as 'creator' | 'coach' | 'podcaster' | 'freelancer',
      clients: newOpportunity.clients ? {
        id: newOpportunity.clients.id,
        name: newOpportunity.clients.name,
        email: newOpportunity.clients.email,
        company: newOpportunity.clients.company
      } : undefined
    };
    
    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/opportunities - Updates opportunity with timezone-aware dates
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
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      );
    }
    
    // Get user's timezone for proper date handling
    const { data: userData } = await supabase
      .from('users')
      .select('timezone')
      .eq('id', userId)
      .single();
    
    const userTimezone = userData?.timezone || 'UTC';
    
    // Convert dates to UTC for storage
    const convertToUTC = (dateString: string | null | undefined): string | null => {
      if (!dateString) return null;
      
      if (dateString.includes('T') && (dateString.includes('Z') || dateString.includes('+'))) {
        return dateString;
      }
      
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return `${dateString}T00:00:00.000Z`;
      }
      
      try {
        const localDate = new Date(dateString);
        if (isNaN(localDate.getTime())) {
          throw new Error('Invalid date format');
        }
        
        const utcDate = new Date(localDate.toLocaleString('en-US', { timeZone: userTimezone }));
        return utcDate.toISOString();
      } catch (error) {
        console.error('Error converting date to UTC:', error);
        return null;
      }
    };
    
    // Update opportunity in database with timezone-aware dates
    const { data: updatedOpportunity, error } = await supabase
      .from('opportunities')
      .update({
        client_id: body.client_id,
        title: body.title,
        description: body.description,
        value: body.value,
        status: body.status,
        stage: body.status,
        type: body.type,
        niche: body.niche,
        probability: body.probability,
        expected_close_date: convertToUTC(body.expected_close_date),
        actual_close_date: convertToUTC(body.actual_close_date),
        follow_up_date: convertToUTC(body.follow_up_date),
        discovery_call_date: convertToUTC(body.discovery_call_date),
        scheduled_date: convertToUTC(body.scheduled_date),
        user_timezone: userTimezone,
        notes: body.notes,
        tags: body.tags,
        custom_fields: body.customFields
      })
      .eq('id', body.id)
      .eq('user_id', userId)
      .select(`
        *,
        clients (
          id,
          name,
          email,
          company
        )
      `)
      .single();
    
    if (error) {
      console.error('Error updating opportunity:', error);
      return NextResponse.json(
        { error: 'Failed to update opportunity' },
        { status: 500 }
      );
    }
    
    if (!updatedOpportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }
    
    // Transform to opportunity format
    const opportunity: Opportunity = {
      id: updatedOpportunity.id,
      user_id: updatedOpportunity.user_id,
      client_id: updatedOpportunity.client_id,
      title: updatedOpportunity.title,
      description: updatedOpportunity.description,
      value: updatedOpportunity.value || 0,
      status: updatedOpportunity.status as 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost',
      type: updatedOpportunity.type as 'brand_deal' | 'sponsorship' | 'consulting' | 'coaching' | 'content_creation' | 'other' || 'other',
      probability: updatedOpportunity.probability || 0,
      expected_close_date: updatedOpportunity.expected_close_date,
      actual_close_date: updatedOpportunity.actual_close_date,
      follow_up_date: updatedOpportunity.follow_up_date,
      discovery_call_date: updatedOpportunity.discovery_call_date,
      scheduled_date: updatedOpportunity.scheduled_date,
      user_timezone: updatedOpportunity.user_timezone,
      notes: updatedOpportunity.notes,
      tags: updatedOpportunity.tags || [],
      created_at: updatedOpportunity.created_at,
      updated_at: updatedOpportunity.updated_at,
      niche: updatedOpportunity.niche as 'creator' | 'coach' | 'podcaster' | 'freelancer',
      clients: updatedOpportunity.clients ? {
        id: updatedOpportunity.clients.id,
        name: updatedOpportunity.clients.name,
        email: updatedOpportunity.clients.email,
        company: updatedOpportunity.clients.company
      } : undefined
    };
    
    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Error in PUT /api/opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/opportunities
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
        { error: 'Opportunity ID is required' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting opportunity:', error);
      return NextResponse.json(
        { error: 'Failed to delete opportunity' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 