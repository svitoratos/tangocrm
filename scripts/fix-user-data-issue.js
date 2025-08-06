const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

async function diagnoseUserDataIssue() {
  try {
    console.log('🔧 Diagnosing user data issue...\n');

    // 1. Check all users in database
    console.log('1️⃣ Checking all users in database...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.log('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`✅ Found ${users.length} users in database:`);
    
    const duplicateEmails = {};
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.id})`);
      console.log(`      Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log(`      Onboarding: ${user.onboarding_completed || false}`);
      console.log(`      Subscription: ${user.subscription_status || 'none'}`);
      console.log(`      Niches: ${user.niches?.join(', ') || 'none'}`);
      
      // Track duplicate emails
      if (duplicateEmails[user.email]) {
        duplicateEmails[user.email].push(user);
      } else {
        duplicateEmails[user.email] = [user];
      }
    });

    // 2. Check for duplicate emails
    console.log('\n2️⃣ Checking for duplicate emails...');
    const problematicEmails = Object.entries(duplicateEmails).filter(([email, users]) => users.length > 1);
    
    if (problematicEmails.length > 0) {
      console.log(`⚠️  Found ${problematicEmails.length} emails with multiple users:`);
      problematicEmails.forEach(([email, userList]) => {
        console.log(`   ${email}: ${userList.length} users`);
        userList.forEach(user => {
          console.log(`      - ${user.id} (created: ${new Date(user.created_at).toLocaleDateString()})`);
        });
      });
    } else {
      console.log('✅ No duplicate emails found');
    }

    // 3. Check Stripe customers
    console.log('\n3️⃣ Checking Stripe customers...');
    const { data: stripeCustomers } = await stripe.customers.list({ limit: 20 });
    
    console.log(`✅ Found ${stripeCustomers.data.length} Stripe customers:`);
    stripeCustomers.data.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.email} (${customer.id})`);
      console.log(`      Created: ${new Date(customer.created * 1000).toLocaleDateString()}`);
      console.log(`      Metadata:`, customer.metadata);
    });

    // 4. Identify the root cause
    console.log('\n4️⃣ Root cause analysis...');
    
    const stevenEmail = 'stevenvitoratos@gmail.com';
    const stevenUsers = users.filter(u => u.email === stevenEmail);
    
    if (stevenUsers.length > 1) {
      console.log('🚨 CRITICAL ISSUE DETECTED:');
      console.log(`   Multiple users with email: ${stevenEmail}`);
      console.log('   This is causing the upsertProfile function to update the wrong user!');
      
      // Find the original user (earliest created)
      const originalUser = stevenUsers.reduce((earliest, current) => 
        new Date(current.created_at) < new Date(earliest.created_at) ? current : earliest
      );
      
      console.log(`   Original user: ${originalUser.id} (created: ${new Date(originalUser.created_at).toLocaleDateString()})`);
      
      // Find users that should be separate
      const duplicateUsers = stevenUsers.filter(u => u.id !== originalUser.id);
      console.log(`   Duplicate users that need to be fixed: ${duplicateUsers.length}`);
      
      return {
        issue: 'duplicate_emails',
        originalUser,
        duplicateUsers,
        allUsers: users
      };
    }

    // 5. Check if there are users with different Clerk IDs but same email
    console.log('\n5️⃣ Checking for Clerk ID vs email mismatches...');
    
    const emailGroups = {};
    users.forEach(user => {
      if (!emailGroups[user.email]) {
        emailGroups[user.email] = [];
      }
      emailGroups[user.email].push(user);
    });

    const mismatchedGroups = Object.entries(emailGroups).filter(([email, userList]) => {
      // Check if users have different IDs but same email
      const uniqueIds = [...new Set(userList.map(u => u.id))];
      return uniqueIds.length > 1;
    });

    if (mismatchedGroups.length > 0) {
      console.log('🚨 CLERK ID MISMATCH DETECTED:');
      mismatchedGroups.forEach(([email, userList]) => {
        console.log(`   Email: ${email}`);
        userList.forEach(user => {
          console.log(`      - Clerk ID: ${user.id} (created: ${new Date(user.created_at).toLocaleDateString()})`);
        });
      });
    }

    console.log('\n🎉 Diagnosis completed!');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

async function fixUserDataIssue() {
  try {
    console.log('🔧 Fixing user data issue...\n');

    // 1. Get diagnosis
    const diagnosis = await diagnoseUserDataIssue();
    
    if (!diagnosis || diagnosis.issue !== 'duplicate_emails') {
      console.log('❌ No fixable issues found');
      return;
    }

    const { originalUser, duplicateUsers, allUsers } = diagnosis;

    console.log('🔧 Starting fix process...');

    // 2. For each duplicate user, we need to:
    //    a) Get their actual Clerk user data
    //    b) Update their email to match their Clerk email
    //    c) Ensure they have the correct user ID

    for (const duplicateUser of duplicateUsers) {
      console.log(`\n🔧 Processing duplicate user: ${duplicateUser.id}`);
      
      try {
        // Check if this user has any meaningful data
        const hasData = duplicateUser.onboarding_completed || 
                       duplicateUser.subscription_status === 'active' ||
                       (duplicateUser.niches && duplicateUser.niches.length > 0);

        if (hasData) {
          console.log('   ⚠️  User has meaningful data - this needs manual intervention');
          console.log('   Data:', {
            onboarding: duplicateUser.onboarding_completed,
            subscription: duplicateUser.subscription_status,
            niches: duplicateUser.niches
          });
        } else {
          console.log('   ✅ User has no meaningful data - safe to delete');
          
          // Delete the duplicate user
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', duplicateUser.id);
          
          if (deleteError) {
            console.log('   ❌ Error deleting user:', deleteError);
          } else {
            console.log('   ✅ Deleted duplicate user');
          }
        }
      } catch (error) {
        console.log('   ❌ Error processing user:', error.message);
      }
    }

    // 3. Fix the upsertProfile function to prevent this in the future
    console.log('\n🔧 Preventing future issues...');
    console.log('   The upsertProfile function needs to be updated to:');
    console.log('   1. Never update existing users by email');
    console.log('   2. Always create new users with their correct Clerk ID');
    console.log('   3. Use email only for validation, not for updates');

    console.log('\n🎉 Fix process completed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the diagnosis
if (require.main === module) {
  diagnoseUserDataIssue();
}

module.exports = { diagnoseUserDataIssue, fixUserDataIssue }; 