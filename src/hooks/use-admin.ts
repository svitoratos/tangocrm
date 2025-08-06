import { useUser, useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';
import { isAdminEmail } from '@/lib/admin-config';

export function useAdmin() {
  const { user, isLoaded } = useUser();
  const { sessionClaims } = useAuth();
  
  const isAdmin = useMemo(() => {
    if (!isLoaded || !user) return false;
    
    const userEmail = user.emailAddresses?.[0]?.emailAddress;
    
    // Check both publicMetadata and sessionClaims for admin role
    const publicMetadataRole = user.publicMetadata?.role;
    const sessionClaimsRole = sessionClaims?.metadata?.role;
    
    console.log('useAdmin check for user:', userEmail, {
      publicMetadataRole,
      sessionClaimsRole,
      isLoaded,
      hasUser: !!user,
      userId: user.id,
      sessionClaimsUserId: sessionClaims?.sub
    });
    
    // Ensure we're checking the correct user's session claims
    const isCorrectUser = sessionClaims?.sub === user.id;
    
    // Check if user has admin role in metadata OR if their email is in admin list
    const isAdminByRole = publicMetadataRole === 'admin';
    const isAdminByEmail = userEmail ? isAdminEmail(userEmail) : false;
    
    const isAdminUser = isAdminByRole || isAdminByEmail;
    
    console.log('Final isAdmin result:', isAdminUser, {
      isAdminByRole,
      isAdminByEmail,
      userEmail,
      isCorrectUser
    });
    
    return isAdminUser;
  }, [user, isLoaded, sessionClaims]);
  
  return {
    isAdmin,
    isLoaded,
    user
  };
} 