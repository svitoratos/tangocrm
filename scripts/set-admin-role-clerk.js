const { clerkClient } = require('@clerk/nextjs/server');

async function setAdminRole() {
  try {
    console.log('🔧 Setting up admin role in Clerk...');
    
    // You'll need to replace this with your actual Clerk user ID
    // You can find this in your Clerk dashboard or by checking the browser console
    const userId = process.argv[2];
    
    if (!userId) {
      console.log('❌ Please provide your Clerk user ID as an argument');
      console.log('Usage: node scripts/set-admin-role-clerk.js YOUR_CLERK_USER_ID');
      console.log('');
      console.log('To find your Clerk user ID:');
      console.log('1. Go to your Clerk Dashboard');
      console.log('2. Navigate to Users');
      console.log('3. Find your email and copy the User ID');
      console.log('4. Run: node scripts/set-admin-role-clerk.js YOUR_USER_ID');
      return;
    }

    console.log(`📝 Setting admin role for user: ${userId}`);
    
    // Update the user's publicMetadata to include admin role
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role: 'admin' },
    });

    console.log('✅ Admin role set successfully!');
    console.log('');
    console.log('🔄 Please restart your development server and try accessing the dashboard again.');
    console.log('💡 You should now be able to access all niches and the admin panel.');
    
  } catch (error) {
    console.error('❌ Error setting admin role:', error);
    console.log('');
    console.log('🔧 Alternative manual method:');
    console.log('1. Go to your Clerk Dashboard');
    console.log('2. Navigate to Users');
    console.log('3. Find your email address');
    console.log('4. Click on your user');
    console.log('5. Go to "Metadata" tab');
    console.log('6. Add: role = "admin"');
    console.log('7. Save changes');
  }
}

setAdminRole(); 