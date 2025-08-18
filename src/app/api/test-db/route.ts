import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Testing database connection...');
    
    // Test 1: Check if we can connect to the database
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    console.log('🔧 Regular client test:', { data: testData, error: testError });
    
    // Test 2: Check if admin client works
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    console.log('🔧 Admin client test:', { data: adminData, error: adminError });
    
    // Test 3: Check RLS status
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('get_rls_status');
    
    console.log('🔧 RLS status test:', { data: rlsData, error: rlsError });
    
    // Test 4: Try to insert a test record with admin client
    const testUserId = `test-${Date.now()}`;
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        onboarding_completed: false,
        subscription_status: 'inactive',
        subscription_tier: 'none',
        primary_niche: 'creator',
        niches: ['creator']
      })
      .select()
      .single();
    
    console.log('🔧 Insert test:', { data: insertData, error: insertError });
    
    // Clean up test record
    if (insertData) {
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', testUserId);
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        regularClient: { success: !testError, error: testError },
        adminClient: { success: !adminError, error: adminError },
        rlsStatus: { success: !rlsError, error: rlsError },
        insertTest: { success: !insertError, error: insertError }
      },
      environment: {
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL
      }
    });
    
  } catch (error) {
    console.error('❌ Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
