import { useUser, useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';

export function useAdmin() {
  const { user, isLoaded } = useUser();
  const { sessionClaims } = useAuth();
  
  const isAdmin = useMemo(() => {
    if (!isLoaded || !user) return false;
    
    // Check both publicMetadata and sessionClaims for admin role
    const publicMetadataRole = user.publicMetadata?.role;
    const sessionClaimsRole = sessionClaims?.metadata?.role;
    
    console.log('useAdmin check for user:', user.emailAddresses?.[0]?.emailAddress, {
      publicMetadataRole,
      sessionClaimsRole,
      isLoaded,
      hasUser: !!user,
      userId: user.id,
      sessionClaimsUserId: sessionClaims?.sub
    });
    
    // Ensure we're checking the correct user's session claims
    const isCorrectUser = sessionClaims?.sub === user.id;
    
    // Only return true if the role is explicitly 'admin' in publicMetadata
    // This is more reliable since it's what gets updated when we set roles via admin panel
    const isAdminUser = publicMetadataRole === 'admin';
    
    console.log('Final isAdmin result:', isAdminUser, 'isCorrectUser:', isCorrectUser);
    
    return isAdminUser;
  }, [user, isLoaded, sessionClaims]);
  
  return {
    isAdmin,
    isLoaded,
    user
  };
} 