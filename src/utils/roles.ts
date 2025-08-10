import { auth, clerkClient } from '@clerk/nextjs/server'
import { isAdminEmail } from '@/lib/admin-config'

export type Roles = 'admin' | 'user'

export const checkRole = async (role: Roles) => {
  const { sessionClaims, userId } = await auth()
  
  console.log('🔧 checkRole called with role:', role);
  console.log('🔧 sessionClaims:', {
    email: sessionClaims?.email,
    metadata: sessionClaims?.metadata,
    sub: sessionClaims?.sub,
    userId
  });
  
  // Check if user has the role in session claims
  const hasRole = sessionClaims?.metadata?.role === role
  
  // For admin role, also check if user's email is in admin list
  if (role === 'admin') {
    // Get user email from session claims first
    let userEmail = sessionClaims?.email as string
    
    // If no email in session claims, fetch user data from Clerk
    if (!userEmail && userId) {
      try {
        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        userEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress || ''
        console.log('🔧 Fetched user email from Clerk:', userEmail);
      } catch (error) {
        console.error('🔧 Error fetching user from Clerk:', error);
      }
    }
    
    // Check if user has admin role OR if their email is in admin list
    const isAdminByRole = hasRole
    const isAdminByEmail = userEmail ? isAdminEmail(userEmail) : false
    
    console.log('🔧 checkRole admin check:', {
      userEmail,
      hasRole,
      isAdminByRole,
      isAdminByEmail,
      result: isAdminByRole || isAdminByEmail
    })
    
    return isAdminByRole || isAdminByEmail
  }
  
  console.log('🔧 checkRole result for non-admin role:', hasRole);
  return hasRole
} 