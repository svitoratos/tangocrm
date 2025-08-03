const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAmandaUser() {
  try {
    console.log('🔍 Checking amanda.carluccio@gmail.com user...');
    
    // First, try to find by email
    const { data: userByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'amanda.carluccio@gmail.com')
      .single();
    
    if (emailError) {
      console.log('❌ Error finding user by email:', emailError);
    } else if (userByEmail) {
      console.log('✅ Found user by email:', {
        id: userByEmail.id,
        email: userByEmail.email,
        niches: userByEmail.niches,
        primary_niche: userByEmail.primary_niche,
        onboarding_completed: userByEmail.onboarding_completed,
        subscription_status: userByEmail.subscription_status,
        stripe_customer_id: userByEmail.stripe_customer_id,
        created_at: userByEmail.created_at,
        updated_at: userByEmail.updated_at
      });
    } else {
      console.log('❌ No user found with email amanda.carluccio@gmail.com');
    }
    
    // Also check all users to see if there are any with similar email
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, email, niches, primary_niche, onboarding_completed')
      .ilike('email', '%amanda%');
    
    if (allUsersError) {
      console.log('❌ Error fetching all users:', allUsersError);
    } else {
      console.log('🔍 Users with "amanda" in email:', allUsers);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAmandaUser(); 