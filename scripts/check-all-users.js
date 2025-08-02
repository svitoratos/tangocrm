require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllUsers() {
  console.log('🔍 Checking all users with hello@gotangocrm.com email...\n');

  try {
    const email = 'hello@gotangocrm.com';
    
    // Get all users with this email
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`Found ${users.length} user(s) with email: ${email}\n`);

    users.forEach((user, index) => {
      console.log(`📊 User ${index + 1}:`);
      console.log(`   - User ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Subscription Status: ${user.subscription_status}`);
      console.log(`   - Subscription Tier: ${user.subscription_tier}`);
      console.log(`   - Primary Niche: ${user.primary_niche}`);
      console.log(`   - Niches: [${(user.niches || []).join(', ')}]`);
      console.log(`   - Onboarding Completed: ${user.onboarding_completed}`);
      console.log(`   - Stripe Customer ID: ${user.stripe_customer_id}`);
      console.log(`   - Created At: ${user.created_at}`);
      console.log(`   - Updated At: ${user.updated_at}`);
      console.log('');
    });

    // Check which user ID matches the frontend
    const frontendUserId = 'user_30YUikU1QBqNiZnHHxrb8uUJs6E';
    const matchingUser = users.find(user => user.id === frontendUserId);
    
    if (matchingUser) {
      console.log('✅ Found user with matching frontend ID!');
      console.log('This user should be working correctly.');
    } else {
      console.log('❌ No user found with frontend ID:', frontendUserId);
      console.log('This explains why the user can\'t see their niches.');
    }

    // Find the user with the most complete data
    const bestUser = users.reduce((best, current) => {
      const bestScore = (best.niches?.length || 0) + (best.onboarding_completed ? 10 : 0) + (best.subscription_status === 'active' ? 5 : 0);
      const currentScore = (current.niches?.length || 0) + (current.onboarding_completed ? 10 : 0) + (current.subscription_status === 'active' ? 5 : 0);
      return currentScore > bestScore ? current : best;
    });

    console.log('🏆 Best user data (most complete):');
    console.log(`   - User ID: ${bestUser.id}`);
    console.log(`   - Niches: [${(bestUser.niches || []).join(', ')}]`);
    console.log(`   - Onboarding Completed: ${bestUser.onboarding_completed}`);
    console.log(`   - Subscription Status: ${bestUser.subscription_status}`);

  } catch (error) {
    console.error('❌ Check error:', error);
  }
}

checkAllUsers(); 