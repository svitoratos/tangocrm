// Script to remove admin role from current user
// Run this in your browser's developer console while signed in as stevenvitoratos@getbondlyapp.com

async function removeAdminRole() {
  try {
    // First, let's check what users have admin roles
    console.log('Checking current admin users...');
    const checkResponse = await fetch('/api/admin/check-roles');
    
    if (checkResponse.ok) {
      const data = await checkResponse.json();
      console.log('Current admin users:', data.adminUsers);
      
      // Find the current user (stevenvitoratos@getbondlyapp.com)
      const currentUser = data.adminUsers.find(user => 
        user.email === 'stevenvitoratos@getbondlyapp.com'
      );
      
      if (currentUser) {
        console.log('Found user to remove admin role from:', currentUser);
        
        // Remove admin role
        const removeResponse = await fetch('/api/admin/check-roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.id,
            action: 'removeAdmin'
          }),
        });
        
        if (removeResponse.ok) {
          console.log('✅ Admin role removed successfully!');
          console.log('Please refresh the page to see the changes.');
        } else {
          const error = await removeResponse.text();
          console.error('❌ Failed to remove admin role:', error);
        }
      } else {
        console.log('User not found in admin list');
      }
    } else {
      console.error('❌ Failed to check admin users');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
removeAdminRole(); 