import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkRole } from '@/utils/roles';
import { isAdminEmail } from '@/lib/admin-config';

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    console.log('🔧 Debug admin check:', {
      userId,
      hasSessionClaims: !!sessionClaims,
      sessionClaimsEmail: sessionClaims?.email,
      sessionClaimsMetadata: sessionClaims?.metadata
    });

    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'No userId found',
        isAuthenticated: false 
      });
    }

    // Get user email from session claims
    const userEmail = sessionClaims?.email as string;
    console.log('🔧 User email from session claims:', userEmail);

    // Check if email is in admin list
    const isEmailAdmin = userEmail ? isAdminEmail(userEmail) : false;
    console.log('🔧 Is email admin:', isEmailAdmin, 'for email:', userEmail);

    // Check role using our function
    const hasAdminRole = await checkRole('admin');
    console.log('🔧 Has admin role:', hasAdminRole);

    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      userId,
      userEmail,
      isEmailAdmin,
      hasAdminRole,
      sessionClaims: {
        email: sessionClaims?.email,
        metadata: sessionClaims?.metadata,
        sub: sessionClaims?.sub
      },
      adminEmails: ['stevenvitoratos@gmail.com'] // Show what emails we're checking against
    });

  } catch (error) {
    console.error('🔧 Debug admin check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}