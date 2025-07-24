import { NextRequest, NextResponse } from 'next/server';

// GET /api/opportunities/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Remove sample opportunity data
    // title: 'Sample Opportunity',
    // description: 'Sample opportunity description',
    // notes: 'Sample notes',
    // tags: ['sample', 'opportunity'],
    // name: 'Sample Client',
    // company: 'Sample Company'

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity' },
      { status: 500 }
    );
  }
}

// PUT /api/opportunities/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updatedOpportunity = {
      id,
      ...body,
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json(updatedOpportunity);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to update opportunity' },
      { status: 500 }
    );
  }
}

// DELETE /api/opportunities/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to delete opportunity' },
      { status: 500 }
    );
  }
}
