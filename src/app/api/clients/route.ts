import { NextRequest, NextResponse } from 'next/server';

// Local storage key for clients
const CLIENTS_KEY = 'tango-clients';

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
  niche: string;
}

// GET /api/clients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');
    
    // Simulate database fetch
    let clients: Client[] = [
      {
        id: '1',
        user_id: 'local-user',
        name: 'Nike Inc',
        email: 'partnerships@nike.com',
        company: 'Nike',
        status: 'client',
        notes: 'Great collaboration partner, repeat client',
        tags: ['sportswear', 'major-brand', 'repeat-client'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        niche: 'creator'
      },
      {
        id: '2',
        user_id: 'local-user',
        name: 'Tech Startup LLC',
        email: 'founder@techstartup.com',
        company: 'Tech Startup LLC',
        status: 'lead',
        notes: 'Interested in coaching program, discovery call scheduled',
        tags: ['tech', 'startup', 'potential-client'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        niche: 'coach'
      },
      {
        id: '3',
        user_id: 'local-user',
        name: 'Podcast Sponsor Co',
        email: 'sponsor@podcastco.com',
        company: 'Podcast Sponsor Co',
        status: 'lead',
        notes: 'Reached out about podcast sponsorship',
        tags: ['podcast', 'sponsorship', 'new-lead'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        niche: 'podcaster'
      }
    ];
    
    // Filter by niche if provided
    const filtered = niche ? clients.filter(client => client.niche === niche) : clients;
    
    return NextResponse.json(filtered);
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
    const body = await request.json();
    
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: 'local-user',
      name: body.name || 'New Client',
      email: body.email,
      phone: body.phone,
      company: body.company,
      status: body.status || 'lead',
      notes: body.notes,
      tags: body.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      niche: body.niche || 'creator'
    };
    
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
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }
    
    const updatedClient = {
      id,
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}
