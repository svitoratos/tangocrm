import { NextRequest, NextResponse } from 'next/server';
import { clientOperations } from '@/lib/database';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { auth } from '@clerk/nextjs/server';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: 'lead' | 'prospect' | 'client' | 'inactive';
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// GET /api/clients
export async function GET(request: NextRequest) {
  try {
    // SECURITY FIX: Add authentication check
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');
    
    // SECURITY FIX: Use authenticated user's ID - NEVER hardcode
    const correctUserId = userId;
    
    // Get clients using database operations with niche filtering
    const clients = await clientOperations.getAll(correctUserId, niche || undefined);
    
    console.log('🔍 Fetched clients from database:', clients.length, 'for niche:', niche);
    
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/clients
export async function POST(request: NextRequest) {
  try {
    // SECURITY FIX: Add authentication check
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // SECURITY FIX: Use authenticated user's ID - NEVER hardcode
    const correctUserId = userId;
    
    // SECURITY NOTE: Always use authenticated user's ID - never override with email lookup
    // The client being created belongs to the authenticated user, not to any email provided
    
    // Create client using database operations
    const newClient = await clientOperations.create({
      user_id: correctUserId,
      niche: body.niche || 'creator', // Default to creator if not specified
      name: body.name || 'New Client',
      email: body.email,
      phone: body.phone,
      company: body.company,
      website: null,
      social_media: null,
      status: body.status || 'client',
      notes: body.notes,
      tags: body.tags || []
    });
    
    if (!newClient) {
      throw new Error('Failed to create client in database');
    }
    
    console.log('🔍 Created client in database:', newClient);
    
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

// PUT /api/clients
export async function PUT(request: NextRequest) {
  try {
    // SECURITY FIX: Add authentication check
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
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }
    
    // SECURITY FIX: Use authenticated user's ID - NEVER hardcode
    const correctUserId = userId;
    
    // Update client using database operations with niche filtering
    const updatedClient = await clientOperations.update(id, correctUserId, updateData, updateData.niche);
    
    if (!updatedClient) {
      throw new Error('Failed to update client in database');
    }
    
    console.log('🔍 Updated client in database:', updatedClient);
    
    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients
export async function DELETE(request: NextRequest) {
  try {
    // SECURITY FIX: Add authentication check
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
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }
    
    // SECURITY FIX: Use authenticated user's ID - NEVER hardcode
    const correctUserId = userId;
    
    // Get the niche from the client before deleting
    const client = await clientOperations.getById(id, correctUserId);
    const clientNiche = client?.niche;
    
    // Delete client using database operations with niche filtering
    const deletedClient = await clientOperations.delete(id, correctUserId, clientNiche);
    
    if (!deletedClient) {
      throw new Error('Failed to delete client from database');
    }
    
    console.log('🔍 Deleted client from database:', deletedClient);
    
    return NextResponse.json({ success: true, deletedClient });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
