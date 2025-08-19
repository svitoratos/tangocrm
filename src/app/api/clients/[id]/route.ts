import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { clientUpdateSchema, validateInput } from '@/lib/validation';

// GET /api/clients/[id]
export async function GET(
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
    
    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch client from database with proper authorization
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching client:', error);
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id]
export async function PUT(
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
    const body = await request.json();
    
    // Add ID to body for validation
    body.id = id;
    
    // Validate input data
    const validation = validateInput(clientUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      );
    }
    
    const validatedData = validation.data;
    
    // Update client in database with proper authorization
    const { data: updatedClient, error } = await supabaseAdmin
      .from('clients')
      .update({
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company,
        phone: validatedData.phone,
        website: validatedData.website,
        social_media: validatedData.social_media,
        notes: validatedData.notes,
        tags: validatedData.tags,
        status: validatedData.status,
        niche: validatedData.niche,
        updated_at: new Date().toISOString()
      })
      .eq('id', validatedData.id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating client:', error);
      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: 500 }
      );
    }

    if (!updatedClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id]
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
    
    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }
    
    // Delete client from database with proper authorization
    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting client:', error);
      return NextResponse.json(
        { error: 'Failed to delete client' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
