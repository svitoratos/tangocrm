import { auth } from '@clerk/nextjs/server'
import { isAdminEmail } from '@/lib/admin-config'

export type Roles = 'admin' | 'user'

export const checkRole = async (role: Roles) => {
  const { sessionClaims, userId } = await auth()
  
  console.log('🔧 checkRole called with role:', role);
  console.log('🔧 sessionClaims:', {
    email: sessionClaims?.email,
    metadata: sessionClaims?.metadata,
    sub: sessionClaims?.sub
  });
  
  // Check if user has the role in session claims
  const hasRole = sessionClaims?.metadata?.role === role
  
  // For admin role, also check if user's email is in admin list
  if (role === 'admin') {
    // Get user email from session claims
    const userEmail = sessionClaims?.email as string
    
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