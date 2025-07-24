import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/content-items/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Remove sample content item data
    // title: 'Sample Content',
    // description: 'Sample content description',
    
    const { data: contentItem, error } = await supabaseAdmin
      .from('content_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching content item:', error);
      return NextResponse.json(
        { error: 'Failed to fetch content item' },
        { status: 500 }
      );
    }

    if (!contentItem) {
      return NextResponse.json(
        { error: 'Content item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(contentItem);
  } catch (error) {
    console.error('Error fetching content item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content item' },
      { status: 500 }
    );
  }
}

// PUT /api/content-items/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== BACKEND API DEBUG START ===');
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    console.log('=== BACKEND RECEIVED DATA ===');
    console.log('User ID:', userId);
    console.log('Content Item ID:', id);
    console.log('Request body:', body);
    console.log('Request body JSON:', JSON.stringify(body, null, 2));
    
    // Debug: Check specific date fields
    console.log('=== BACKEND DATE FIELD CHECK ===');
    console.log('body.creationDate:', body.creationDate);
    console.log('body.postDate:', body.postDate);
    console.log('body.startDate:', body.startDate);
    console.log('body.endDate:', body.endDate);
    console.log('body.deadline:', body.deadline);
    console.log('body.enrollmentDeadline:', body.enrollmentDeadline);
    console.log('Type of body.creationDate:', typeof body.creationDate);
    console.log('Type of body.postDate:', typeof body.postDate);
    console.log('Type of body.startDate:', typeof body.startDate);
    console.log('Type of body.endDate:', typeof body.endDate);
    console.log('Type of body.deadline:', typeof body.deadline);
    console.log('Type of body.enrollmentDeadline:', typeof body.enrollmentDeadline);
    
    // Prepare the update data
    const updateData = {
      title: body.title,
      description: body.description,
      stage: body.stage,
      niche: body.niche,
      type: body.type || body.postType,
      platform: body.platform,
      brand: body.brand,
      creation_date: body.creationDate,
      post_date: body.postDate || body.publishDate,
      hashtags: body.hashtags ? (Array.isArray(body.hashtags) ? body.hashtags : body.hashtags.split(',').map((tag: string) => tag.trim())) : [],
      hook: body.hook,
      notes: body.notes,
      views: body.views,
      likes: body.likes,
      comments: body.comments,
      shares: body.shares,
      saves: body.saves,
      engagement_rate: body.engagementRate,
      revenue: body.revenue,
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

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    console.log('=== BACKEND DATABASE UPDATE ===');
    console.log('Final updateData being sent to database:', updateData);
    console.log('updateData JSON:', JSON.stringify(updateData, null, 2));
    
    // Debug: Check specific date fields in updateData
    console.log('=== BACKEND FINAL DATE CHECK ===');
    console.log('updateData.creation_date:', updateData.creation_date);
    console.log('updateData.post_date:', updateData.post_date);
    console.log('updateData.start_date:', updateData.start_date);
    console.log('updateData.end_date:', updateData.end_date);
    console.log('updateData.deadline:', updateData.deadline);
    console.log('updateData.enrollment_deadline:', updateData.enrollment_deadline);
    
    const { data: updatedContentItem, error } = await supabaseAdmin
      .from('content_items')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    console.log('=== BACKEND DATABASE RESPONSE ===');
    console.log('Database error:', error);
    console.log('Updated content item:', updatedContentItem);
    console.log('Updated content item JSON:', JSON.stringify(updatedContentItem, null, 2));

    if (error) {
      console.error('Error updating content item:', error);
      return NextResponse.json(
        { error: 'Failed to update content item' },
        { status: 500 }
      );
    }

    console.log('=== BACKEND SUCCESS RESPONSE ===');
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

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
