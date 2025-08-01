import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/content-items
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
    
    // Build the query
    let query = supabaseAdmin
      .from('content_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Filter by niche if provided
    if (niche) {
      query = query.eq('niche', niche);
    }

    const { data: contentItems, error } = await query;

    if (error) {
      console.error('Error fetching content items:', error);
      return NextResponse.json(
        { error: 'Failed to fetch content items' },
        { status: 500 }
      );
    }

    return NextResponse.json(contentItems || []);
  } catch (error) {
    console.error('Error in content items GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/content-items
export async function POST(request: NextRequest) {
  try {
    console.log('=== BACKEND CREATE API DEBUG START ===');
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    console.log('=== BACKEND CREATE RECEIVED DATA ===');
    console.log('User ID:', userId);
    console.log('Request body:', body);
    console.log('Request body JSON:', JSON.stringify(body, null, 2));
    
    // Debug: Check specific date fields
    console.log('=== BACKEND CREATE DATE FIELD CHECK ===');
    console.log('body.postDate:', body.postDate);
    console.log('body.startDate:', body.startDate);
    console.log('body.endDate:', body.endDate);
    console.log('body.deadline:', body.deadline);
    console.log('body.enrollmentDeadline:', body.enrollmentDeadline);
    console.log('Type of body.postDate:', typeof body.postDate);
    console.log('Type of body.startDate:', typeof body.startDate);
    console.log('Type of body.endDate:', typeof body.endDate);
    console.log('Type of body.deadline:', typeof body.deadline);
    console.log('Type of body.enrollmentDeadline:', typeof body.enrollmentDeadline);
    
    // Prepare the content item data
    const contentItemData = {
      user_id: userId,
      title: body.title || 'Untitled Content',
      description: body.description,
      stage: body.stage || 'planning',
      niche: body.niche || 'creator',
      content_type: body.content_type,
      type: body.type || body.postType,
      platform: body.platform,
      brand: body.brand,
      creation_date: body.creationDate || new Date().toISOString(),
      post_date: body.post_date || body.postDate || body.publishDate,
      hashtags: body.hashtags ? (Array.isArray(body.hashtags) ? body.hashtags : body.hashtags.split(',').map((tag: string) => tag.trim())) : [],
      hook: body.hook,
      notes: body.notes,
      views: body.views || 0,
      likes: body.likes || 0,
      comments: body.comments || 0,
      shares: body.shares || 0,
      saves: body.saves || 0,
      engagement_rate: body.engagementRate,
      revenue: body.revenue || 0,
      // Coach-specific fields
      program_type: body.programType,
      custom_program_type: body.customProgramType,
      length: body.length || body.sessionCount,
      price: body.price,
      enrolled: body.enrolled || body.currentEnrollments,
      milestones: body.milestones || body.progressMilestones,
      start_date: body.startDate,
      end_date: body.endDate,
      enrollment_deadline: body.enrollmentDeadline,
      client_progress: body.clientProgress,
      hosting_platform: body.hostingPlatform,
      // Podcast-specific fields
      guest: body.guest,
      sponsor: body.sponsor,
      duration: body.duration,
      custom_duration: body.customDuration,
      topics: body.topics,
      script: body.script,
      // Freelancer-specific fields
      client: body.client || body.clientName,
      deadline: body.deadline || body.dueDate,
      budget: body.budget,
      deliverables: body.deliverables ? (Array.isArray(body.deliverables) ? body.deliverables : body.deliverables.split(',').map((item: string) => item.trim())) : []
    };

    console.log('=== BACKEND CREATE DATABASE INSERT ===');
    console.log('Final contentItemData being sent to database:', contentItemData);
    console.log('contentItemData JSON:', JSON.stringify(contentItemData, null, 2));
    
    // Debug: Check specific date fields in contentItemData
    console.log('=== BACKEND CREATE FINAL DATE CHECK ===');
    console.log('contentItemData.post_date:', contentItemData.post_date);
    console.log('contentItemData.start_date:', contentItemData.start_date);
    console.log('contentItemData.end_date:', contentItemData.end_date);
    console.log('contentItemData.deadline:', contentItemData.deadline);
    console.log('contentItemData.enrollment_deadline:', contentItemData.enrollment_deadline);
    
    // Remove undefined values to prevent database errors
    Object.keys(contentItemData).forEach(key => {
      if (contentItemData[key as keyof typeof contentItemData] === undefined) {
        delete contentItemData[key as keyof typeof contentItemData];
      }
    });
    
    console.log('=== BACKEND CREATE CLEANED DATA ===');
    console.log('Cleaned contentItemData:', contentItemData);
    
    const { data: newContentItem, error } = await supabaseAdmin
      .from('content_items')
      .insert(contentItemData)
      .select()
      .single();

    console.log('=== BACKEND CREATE DATABASE RESPONSE ===');
    console.log('Database error:', error);
    console.log('New content item:', newContentItem);
    console.log('New content item JSON:', JSON.stringify(newContentItem, null, 2));

    if (error) {
      console.error('Error creating content item:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to create content item', details: error },
        { status: 500 }
      );
    }

    console.log('=== BACKEND CREATE SUCCESS RESPONSE ===');
    return NextResponse.json(newContentItem, { status: 201 });
  } catch (error) {
    console.error('Error in content items POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/content-items
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
        { error: 'Content item ID is required for update' },
        { status: 400 }
      );
    }

    console.log('=== BACKEND UPDATE API DEBUG ===');
    console.log('User ID:', userId);
    console.log('Request body:', body);
    
    // Prepare the update data (similar to POST but without user_id)
    const updateData = {
      title: body.title || 'Untitled Content',
      description: body.description,
      stage: body.stage || 'planning',
      niche: body.niche || 'creator',
      content_type: body.content_type,
      type: body.type || body.postType,
      platform: body.platform,
      brand: body.brand,
      creation_date: body.creation_date || body.creationDate || new Date().toISOString(),
      post_date: body.post_date || body.postDate || body.publishDate,
      hashtags: body.hashtags ? (Array.isArray(body.hashtags) ? body.hashtags : body.hashtags.split(',').map((tag: string) => tag.trim())) : [],
      hook: body.hook,
      notes: body.notes,
      views: body.views || 0,
      likes: body.likes || 0,
      comments: body.comments || 0,
      shares: body.shares || 0,
      saves: body.saves || 0,
      engagement_rate: body.engagementRate,
      revenue: body.revenue || 0,
      // Coach-specific fields
      program_type: body.programType,
      custom_program_type: body.customProgramType,
      length: body.length || body.sessionCount,
      price: body.price,
      enrolled: body.enrolled || body.currentEnrollments,
      milestones: body.milestones || body.progressMilestones,
      start_date: body.start_date || body.startDate,
      end_date: body.end_date || body.endDate,
      enrollment_deadline: body.enrollmentDeadline,
      client_progress: body.clientProgress,
      hosting_platform: body.hostingPlatform,
      // Podcast-specific fields
      guest: body.guest,
      sponsor: body.sponsor,
      duration: body.duration,
      custom_duration: body.customDuration,
      topics: body.topics,
      script: body.script,
      // Freelancer-specific fields
      client: body.client || body.clientName,
      deadline: body.deadline || body.dueDate,
      budget: body.budget,
      deliverables: body.deliverables ? (Array.isArray(body.deliverables) ? body.deliverables : body.deliverables.split(',').map((item: string) => item.trim())) : []
    };

    // Remove undefined values to prevent database errors
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    console.log('=== BACKEND UPDATE DATABASE UPDATE ===');
    console.log('Update data:', updateData);
    
    const { data: updatedContentItem, error } = await supabaseAdmin
      .from('content_items')
      .update(updateData)
      .eq('id', body.id)
      .eq('user_id', userId)
      .select()
      .single();

    console.log('=== BACKEND UPDATE DATABASE RESPONSE ===');
    console.log('Database error:', error);
    console.log('Updated content item:', updatedContentItem);

    if (error) {
      console.error('Error updating content item:', error);
      return NextResponse.json(
        { error: 'Failed to update content item', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedContentItem);
  } catch (error) {
    console.error('Error in content items PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/content-items/[id]
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
        { error: 'Content item ID is required' },
        { status: 400 }
      );
    }

    // Delete the content item
    const { error } = await supabaseAdmin
      .from('content_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting content item:', error);
      return NextResponse.json(
        { error: 'Failed to delete content item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in content items DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
