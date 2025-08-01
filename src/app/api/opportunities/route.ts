import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { OpportunityDateUtils } from '@/lib/timezone-utils';
import { opportunityActivityService, ActivityChange } from '@/lib/opportunity-activity-service';


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
  customFields?: any;
}

function localDateToUTC(date: Date | string | null | undefined, userTimezone: string): string | null {
  if (!date) return null;
  let localDate: Date;
  if (typeof date === 'string') {
    // If it's already an ISO string with time, just return as-is
    if (date.includes('T')) return date;
    // If it's a date-only string, parse as local date at midnight
    localDate = new Date(date + 'T00:00:00');
  } else {
    localDate = date;
  }
  
  // For now, use a simpler approach - just append T00:00:00.000Z to make it UTC
  // This assumes the date is already in the user's local timezone
  if (typeof date === 'string' && !date.includes('T')) {
    return date + 'T00:00:00.000Z';
  }
  
  return localDate.toISOString();
}

// GET /api/opportunities
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
    
    // Get the correct user_id for database query (same logic as POST)
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
        console.log('GET - Using existing user ID for query:', correctUserId);
      } else {
        console.log('GET - No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('GET - Error finding existing user, using Clerk ID:', correctUserId);
    }
    
    // Build query
    let query = supabaseAdmin
      .from('opportunities')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          company
        )
      `)
      .eq('user_id', correctUserId);
    
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
    

    
    // Transform opportunities data
    const opportunities: Opportunity[] = (opportunitiesData || []).map(opportunity => {
      console.log('Processing opportunity:', opportunity.id, 'with custom_fields:', opportunity.custom_fields);
      console.log('Contact fields in custom_fields:', {
        contactName: opportunity.custom_fields?.contactName,
        contactEmail: opportunity.custom_fields?.contactEmail,
        contactPhone: opportunity.custom_fields?.contactPhone
      });
      return {
      id: opportunity.id,
      user_id: opportunity.user_id,
      client_id: opportunity.client_id,
      title: opportunity.title,
      description: opportunity.description,
      value: opportunity.value || 0,
      status: opportunity.status as 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost',
      type: opportunity.type as 'brand_deal' | 'sponsorship' | 'consulting' | 'coaching' | 'content_creation' | 'other' || 'other',
      probability: opportunity.probability || 0,
      expected_close_date: opportunity.expected_close_date,
      actual_close_date: opportunity.actual_close_date,
      follow_up_date: opportunity.follow_up_date,
      discovery_call_date: opportunity.discovery_call_date,
      scheduled_date: opportunity.scheduled_date,
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
        } : undefined,
        customFields: opportunity.custom_fields || {}
      };
    });
    
    console.log('Transformed opportunities with customFields:', opportunities.map(opp => ({
      id: opp.id,
      customFields: opp.customFields,
      contactFields: {
        contactName: opp.customFields?.contactName,
        contactEmail: opp.customFields?.contactEmail,
        contactPhone: opp.customFields?.contactPhone
      }
    })));
    
    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Error in GET /api/opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Enhanced POST method with activity tracking
export async function POST(request: NextRequest) {
  try {
    console.log('=== OPPORTUNITY CREATE API DEBUG START ===');
    const { userId } = await auth();
    
    if (!userId) {
      console.log('Unauthorized - no userId');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Opportunity create request body:', body);
    console.log('User ID:', userId);
    
    // Validate required fields
    if (!body.title) {
      console.log('Missing title field');
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Get user's timezone for proper date handling
    let userTimezone = 'UTC';
    try {
      console.log('Looking up user timezone for userId:', userId);
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('timezone')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.log('User lookup error:', userError);
        // Try to find user by email as fallback
        try {
          const { data: userDataByEmail } = await supabaseAdmin
            .from('users')
            .select('timezone')
            .eq('email', 'stevenvitoratos@getbondlyapp.com')
            .single();
          
          if (userDataByEmail?.timezone) {
            userTimezone = userDataByEmail.timezone;
            console.log('Found user timezone by email fallback:', userTimezone);
          }
        } catch (emailError) {
          console.log('Email fallback also failed, using UTC');
        }
      } else if (userData?.timezone) {
        userTimezone = userData.timezone;
        console.log('Found user timezone:', userTimezone);
      } else {
        console.log('No timezone found for user, using UTC');
      }
    } catch (error) {
      console.log('Could not find user by Clerk ID, using default timezone UTC');
      console.log('User lookup exception:', error);
      // Continue with default timezone
    }
    
    // Convert all date fields to UTC for storage using proper timezone conversion
    const expectedCloseDate = localDateToUTC(body.expected_close_date, userTimezone);
    const actualCloseDate = localDateToUTC(body.actual_close_date, userTimezone);
    const followUpDate = localDateToUTC(body.follow_up_date, userTimezone);
    const discoveryCallDate = localDateToUTC(body.discovery_call_date, userTimezone);
    const scheduledDate = localDateToUTC(body.scheduled_date, userTimezone);
    

    
    console.log('=== OPPORTUNITY CREATE DATABASE INSERT ===');
    console.log('User timezone:', userTimezone);
    console.log('Expected close date:', expectedCloseDate);
    console.log('All date fields:', {
      expectedCloseDate,
      actualCloseDate,
      followUpDate,
      discoveryCallDate,
      scheduledDate
    });
    
    // Get the correct user_id for database insertion
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
        console.log('Using existing user ID for database:', correctUserId);
      } else {
        console.log('No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('Error finding existing user, using Clerk ID:', correctUserId);
    }
    
    const insertData = {
      user_id: correctUserId,
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
    };
    
    console.log('Insert data being sent to database:', insertData);
    
    // Create opportunity in database
    const { data: newOpportunity, error } = await supabaseAdmin
      .from('opportunities')
      .insert(insertData)
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
    
    console.log('=== OPPORTUNITY CREATE DATABASE RESPONSE ===');
    console.log('Database error:', error);
    console.log('New opportunity:', newOpportunity);
    
    if (error) {
      console.error('Error creating opportunity:', error);
      return NextResponse.json(
        { error: 'Failed to create opportunity', details: error },
        { status: 500 }
      );
    }

    // Log the opportunity creation activity (non-blocking)
    try {
      await opportunityActivityService.createOpportunityCreatedActivity(newOpportunity);
      console.log('✅ Activity logged for opportunity creation');
    } catch (activityError) {
      console.error('Error logging opportunity creation activity:', activityError);
      // Don't fail the request if activity logging fails
    }

    // If opportunity is created as won, handle client status update
    if (newOpportunity.status === 'won') {
      try {
        // If opportunity has a client_id, update that client's status
        if (newOpportunity.client_id) {
          const { error: clientUpdateError } = await supabaseAdmin
            .from('clients')
            .update({ status: 'client' })
            .eq('id', newOpportunity.client_id)
            .eq('user_id', userId);

          if (clientUpdateError) {
            console.error('Error updating client status:', clientUpdateError);
          } else {
            console.log(`Updated client ${newOpportunity.client_id} status to 'client'`);
          }
        }
        // If no client_id but has client info in custom fields, create or update client
        else if (body.customFields) {
          // Extract client name based on niche
          let clientName = '';
          if (body.niche === 'creator') {
            clientName = body.customFields.brandName || body.customFields.clientName;
          } else if (body.niche === 'coach') {
            clientName = body.customFields.clientName || body.customFields.brandName;
          } else if (body.niche === 'podcaster') {
            clientName = body.customFields.guestOrSponsorName || body.customFields.brandName || body.customFields.clientName || body.customFields.companyName;
            console.log(`Podcaster niche - Extracted client name: ${clientName} from guestOrSponsorName: ${body.customFields.guestOrSponsorName}, brandName: ${body.customFields.brandName}, clientName: ${body.customFields.clientName}, companyName: ${body.customFields.companyName}`);
          } else if (body.niche === 'freelancer') {
            clientName = body.customFields.companyName || body.customFields.clientName || body.customFields.brandName;
            console.log(`Freelancer niche - Extracted client name: ${clientName} from companyName: ${body.customFields.companyName}, clientName: ${body.customFields.clientName}, brandName: ${body.customFields.brandName}`);
          } else {
            // Fallback for any other niche
            clientName = body.customFields.brandName || body.customFields.clientName || body.customFields.companyName;
          }
          
          const contactEmail = body.customFields.contactEmail;
          const contactName = body.customFields.contactName;
          
          if (clientName) {
            // Check if client already exists
            const { data: existingClient } = await supabaseAdmin
              .from('clients')
              .select('id')
              .eq('user_id', userId)
              .eq('name', clientName)
              .single();

            if (existingClient) {
              // Update existing client status
              const { error: clientUpdateError } = await supabaseAdmin
                .from('clients')
                .update({ status: 'client' })
                .eq('id', existingClient.id)
                .eq('user_id', userId);

              if (clientUpdateError) {
                console.error('Error updating existing client status:', clientUpdateError);
              } else {
                console.log(`Updated existing client ${existingClient.id} status to 'client'`);
              }
            } else {
              // Create new client
              const { data: newClient, error: clientCreateError } = await supabaseAdmin
                .from('clients')
                .insert({
                  user_id: userId,
                  name: clientName,
                  email: contactEmail,
                  company: body.customFields.companyName,
                  status: 'client',
                  notes: `Created from won opportunity: ${body.title}`,
                  tags: ['from-opportunity'],
                  niche: body.niche || 'creator'
                })
                .select()
                .single();

              if (clientCreateError) {
                console.error('Error creating new client:', clientCreateError);
              } else {
                console.log(`Created new client ${newClient.id} from won opportunity`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error handling client status update:', error);
        // Don't fail the opportunity creation, just log the error
      }
    }
    
    // Transform to opportunity format
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
      } : undefined,
      customFields: newOpportunity.custom_fields || {}
    };
    
    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/opportunities:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Enhanced PUT method with change detection and activity tracking
export async function PUT(request: NextRequest) {
  try {
    console.log('=== OPPORTUNITY UPDATE API DEBUG START ===');
    const { userId } = await auth();
    
    if (!userId) {
      console.log('Unauthorized - no userId');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Opportunity update request body:', body);
    console.log('User ID:', userId);
    
    if (!body.id) {
      console.log('Missing opportunity ID');
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      );
    }
    
    // Get the correct user_id for database query (same logic as GET/POST)
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
        console.log('PUT - Using existing user ID for query:', correctUserId);
      } else {
        console.log('PUT - No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('PUT - Error finding existing user, using Clerk ID:', correctUserId);
    }
    
    // Get current opportunity data for change detection
    const { data: currentOpportunity, error: fetchError } = await supabaseAdmin
      .from('opportunities')
      .select('*')
      .eq('id', body.id)
      .eq('user_id', correctUserId)
      .single();

    if (fetchError || !currentOpportunity) {
      console.log('PUT - Opportunity not found with ID:', body.id, 'and user_id:', correctUserId);
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }
    
    // Get user's timezone for proper date handling
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('timezone')
      .eq('id', userId)
      .single();
    
    const userTimezone = userData?.timezone || 'UTC';
    
    // Convert all date fields to UTC for storage using proper timezone conversion
    const expectedCloseDate = localDateToUTC(body.expected_close_date, userTimezone);
    const actualCloseDate = localDateToUTC(body.actual_close_date, userTimezone);
    const followUpDate = localDateToUTC(body.follow_up_date, userTimezone);
    const discoveryCallDate = localDateToUTC(body.discovery_call_date, userTimezone);
    const scheduledDate = localDateToUTC(body.scheduled_date, userTimezone);
    

    
    // Prepare update data
    const updateData = {
      client_id: body.client_id,
      title: body.title,
      description: body.description,
      value: body.value,
      status: body.status,
      stage: body.status,
      type: body.type,
      niche: body.niche,
      probability: body.probability,
      expected_close_date: expectedCloseDate,
      actual_close_date: actualCloseDate,
      follow_up_date: followUpDate,
      discovery_call_date: discoveryCallDate,
      scheduled_date: scheduledDate,
      user_timezone: userTimezone,
      tags: body.tags,
      custom_fields: body.customFields
    };

    // Handle notes accumulation - preserve existing notes and append new ones
    if (body.notes) {
      try {
        // Parse existing notes
        let existingNotes: any = {};
        if (currentOpportunity.notes) {
          try {
            existingNotes = JSON.parse(currentOpportunity.notes);
          } catch {
            // If existing notes is not valid JSON, treat it as a simple string
            existingNotes = { notes: currentOpportunity.notes };
          }
        }

        // Parse new notes
        let newNotes: any = {};
        try {
          newNotes = JSON.parse(body.notes);
        } catch {
          // If new notes is not valid JSON, treat it as a simple string
          newNotes = { notes: body.notes };
        }

        // Merge notes - preserve existing notes and add new ones
        const mergedNotes = {
          ...existingNotes,
          ...newNotes,
          // Add timestamp for the latest update
          lastUpdated: new Date().toISOString(),
          // Keep track of all note updates
          noteHistory: [
            ...(existingNotes.noteHistory || []),
            {
              timestamp: new Date().toISOString(),
              notes: newNotes.notes || body.notes,
              stageId: newNotes.stageId || existingNotes.stageId,
              niche: newNotes.niche || existingNotes.niche
            }
          ]
        };

        (updateData as any).notes = JSON.stringify(mergedNotes);
      } catch (error) {
        console.error('Error processing notes:', error);
        // Fallback to simple string concatenation
        const existingNotes = currentOpportunity.notes || '';
        const separator = existingNotes ? '\n\n---\n\n' : '';
        (updateData as any).notes = `${existingNotes}${separator}${body.notes}`;
      }
    }
    
    console.log('=== OPPORTUNITY UPDATE DATABASE UPDATE ===');
    console.log('Update data being sent to database:', updateData);
    
    // Update opportunity in database
    const { data: updatedOpportunity, error } = await supabaseAdmin
      .from('opportunities')
      .update(updateData)
      .eq('id', body.id)
      .eq('user_id', correctUserId)
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
    
    console.log('=== OPPORTUNITY UPDATE DATABASE RESPONSE ===');
    console.log('Database error:', error);
    console.log('Updated opportunity:', updatedOpportunity);
    
    if (error) {
      console.error('Error updating opportunity:', error);
      return NextResponse.json(
        { error: 'Failed to update opportunity', details: error },
        { status: 500 }
      );
    }
    
    if (!updatedOpportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    // Detect changes for activity logging
    const changes = opportunityActivityService.detectChanges(currentOpportunity, updatedOpportunity);
    
    // Log the opportunity update activity (non-blocking)
    if (changes.length > 0) {
      try {
        await opportunityActivityService.createOpportunityUpdatedActivity(updatedOpportunity, changes);
        console.log('✅ Activity logged for opportunity update:', changes.map(c => c.field));
      } catch (activityError) {
        console.error('Error logging opportunity update activity:', activityError);
        // Don't fail the request if activity logging fails
      }
    }

    // If opportunity is marked as won, handle client status update
    if (body.status === 'won') {
      try {
        // If opportunity has a client_id, update that client's status
        if (body.client_id) {
          const { error: clientUpdateError } = await supabaseAdmin
            .from('clients')
            .update({ status: 'client' })
            .eq('id', body.client_id)
            .eq('user_id', userId);

          if (clientUpdateError) {
            console.error('Error updating client status:', clientUpdateError);
          } else {
            console.log(`Updated client ${body.client_id} status to 'client'`);
          }
        }
        // If no client_id but has client info in custom fields, create or update client
        else if (body.customFields) {
          // Extract client name based on niche
          let clientName = '';
          if (body.niche === 'creator') {
            clientName = body.customFields.brandName || body.customFields.clientName;
          } else if (body.niche === 'coach') {
            clientName = body.customFields.clientName || body.customFields.brandName;
          } else if (body.niche === 'podcaster') {
            clientName = body.customFields.guestOrSponsorName || body.customFields.brandName || body.customFields.clientName || body.customFields.companyName;
            console.log(`Podcaster niche - Extracted client name: ${clientName} from guestOrSponsorName: ${body.customFields.guestOrSponsorName}, brandName: ${body.customFields.brandName}, clientName: ${body.customFields.clientName}, companyName: ${body.customFields.companyName}`);
          } else if (body.niche === 'freelancer') {
            clientName = body.customFields.companyName || body.customFields.clientName || body.customFields.brandName;
          } else {
            // Fallback for any other niche
            clientName = body.customFields.brandName || body.customFields.clientName || body.customFields.companyName;
          }
          
          const contactEmail = body.customFields.contactEmail;
          const contactName = body.customFields.contactName;
          
          if (clientName) {
            // Check if client already exists
            const { data: existingClient } = await supabaseAdmin
              .from('clients')
              .select('id')
              .eq('user_id', userId)
              .eq('name', clientName)
              .single();

            if (existingClient) {
              // Update existing client status
              const { error: clientUpdateError } = await supabaseAdmin
                .from('clients')
                .update({ status: 'client' })
                .eq('id', existingClient.id)
                .eq('user_id', userId);

              if (clientUpdateError) {
                console.error('Error updating existing client status:', clientUpdateError);
              } else {
                console.log(`Updated existing client ${existingClient.id} status to 'client'`);
              }
            } else {
              // Create new client with niche-specific notes
              let clientNotes = `Created from won opportunity: ${body.title}`;
              if (body.niche === 'podcaster') {
                const opportunityType = body.customFields.type || body.type || 'podcast';
                clientNotes = `Created from won ${opportunityType} opportunity: ${body.title}`;
                if (body.customFields.guestOrSponsorName) {
                  clientNotes += ` (${body.customFields.guestOrSponsorName})`;
                }
              }
              
              const { data: newClient, error: clientCreateError } = await supabaseAdmin
                .from('clients')
                .insert({
                  user_id: userId,
                  name: clientName,
                  email: contactEmail,
                  company: body.customFields.companyName,
                  status: 'client',
                  notes: clientNotes,
                  tags: ['from-opportunity'],
                  niche: body.niche || 'creator'
                })
                .select()
                .single();

              if (clientCreateError) {
                console.error('Error creating new client:', clientCreateError);
              } else {
                console.log(`Created new client ${newClient.id} from won opportunity`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error handling client status update:', error);
        // Don't fail the opportunity update, just log the error
      }
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
      } : undefined,
      customFields: updatedOpportunity.custom_fields || {}
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
    
    // Get the correct user_id for database query (same logic as GET/POST/PUT)
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
        console.log('DELETE - Using existing user ID for query:', correctUserId);
      } else {
        console.log('DELETE - No existing user found, using Clerk ID:', correctUserId);
      }
    } catch (error) {
      console.log('DELETE - Error finding existing user, using Clerk ID:', correctUserId);
    }
    
    // Delete opportunity from database
    const { error } = await supabaseAdmin
      .from('opportunities')
      .delete()
      .eq('id', id)
      .eq('user_id', correctUserId);
    
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
