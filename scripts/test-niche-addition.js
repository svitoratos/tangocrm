require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNicheAddition() {
  console.log('🔧 Testing niche addition functionality...\n');

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`Found ${users.length} users\n`);

    for (const user of users) {
      console.log(`🔧 User: ${user.email} (${user.id})`);
      console.log(`Current niches: [ ${(user.niches || []).join(', ')} ]`);
      console.log(`Subscription status: ${user.subscription_status}`);
      
      // Test adding a niche
      const testNiche = 'coach';
      const currentNiches = user.niches || [];
      
      if (!currentNiches.includes(testNiche)) {
        console.log(`📝 Testing addition of ${testNiche} niche...`);
        
        const updatedNiches = [...new Set([...currentNiches, testNiche])];
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            niches: updatedNiches,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error(`❌ Failed to add ${testNiche} niche:`, updateError);
        } else {
          console.log(`✅ Successfully added ${testNiche} niche`);
          console.log(`Updated niches: [ ${updatedUser.niches.join(', ')} ]`);
        }
      } else {
        console.log(`✅ User already has ${testNiche} niche`);
      }
      
      console.log('');
    }

    console.log('✅ Finished testing niche addition\n');
    
    console.log('📋 Expected Behavior:');
    console.log('1. ✅ Users can have multiple niches in their niches array');
    console.log('2. ✅ Dashboard should display all subscribed niches in sidebar');
    console.log('3. ✅ Users can switch between their subscribed niches');
    console.log('4. ✅ Payment success should trigger niche addition');
    
  } catch (error) {
    console.error('❌ Error testing niche addition:', error);
  }
}

testNicheAddition(); 