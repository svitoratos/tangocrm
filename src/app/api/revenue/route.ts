import { NextRequest, NextResponse } from 'next/server';

// Local storage key for revenue data
const REVENUE_KEY = 'tango-revenue';

export interface RevenueEntry {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  source: string;
  type: 'opportunity' | 'client' | 'recurring' | 'one-time' | 'other';
  status: 'pending' | 'received' | 'overdue' | 'cancelled';
  date: string;
  description?: string;
  client_id?: string;
  client_name?: string;
  opportunity_id?: string;
  opportunity_title?: string;
  niche: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// GET /api/revenue
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const path = searchParams.get('path');
    
    // Handle summary endpoint
    if (path === 'summary') {
      const summary = {
        total_revenue: 9000,
        monthly_revenue: 7500,
        pending_revenue: 1500,
        revenue_by_source: {
          'Brand Deals': 5000,
          'Coaching': 2500,
          'Sponsorships': 1500
        },
        revenue_by_month: {
          'July': 4000,
          'June': 3500,
          'May': 1500
        }
      };
      
      return NextResponse.json(summary);
    }
    
    // Remove sample revenue data
    
    // Initialize empty revenue array
    let revenue: RevenueEntry[] = [];
    
    // Filter by niche if provided
    if (niche) {
      revenue = revenue.filter(entry => entry.niche === niche);
    }

    // Filter by date range if provided
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      revenue = revenue.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }
    
    return NextResponse.json(revenue);
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue' },
      { status: 500 }
    );
  }
}

// POST /api/revenue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newRevenue: RevenueEntry = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: 'local-user',
      amount: body.amount || 0,
      currency: body.currency || 'USD',
      source: body.source || 'Unknown',
      type: body.type || 'other',
      status: body.status || 'pending',
      date: body.date || new Date().toISOString(),
      description: body.description,
      client_id: body.client_id,
      client_name: body.client_name,
      opportunity_id: body.opportunity_id,
      opportunity_title: body.opportunity_title,
      niche: body.niche || 'creator',
      tags: body.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json(newRevenue, { status: 201 });
  } catch (error) {
    console.error('Error creating revenue entry:', error);
    return NextResponse.json(
      { error: 'Failed to create revenue entry' },
      { status: 500 }
    );
  }
}

// PUT /api/revenue
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Revenue entry ID is required' },
        { status: 400 }
      );
    }
    
    const updatedRevenue = {
      id,
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json(updatedRevenue);
  } catch (error) {
    console.error('Error updating revenue entry:', error);
    return NextResponse.json(
      { error: 'Failed to update revenue entry' },
      { status: 500 }
    );
  }
}
