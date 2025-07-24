"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    // Immediate sign out with direct redirect
    signOut({ redirectUrl: '/' });
  }, [signOut]);

  // Return null - no loading screen
  return null;
} 