import { NextRequest, NextResponse } from 'next/server';

// Stripe removed - payment integration disabled
export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Payment integration disabled - will be replaced with new provider' 
  }, { status: 503 })
} 