"use client";

import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

export const metadata: Metadata = generateMetadata({
  title: 'Sign Out - Tango CRM',
  description: 'Sign out of your Tango CRM account. You will be redirected to the home page after signing out.',
  keywords: [
    'Tango CRM sign out',
    'creator CRM logout',
    'CRM platform logout',
    'creator business logout',
    'Tango CRM account logout',
    'creator tools sign out',
    'CRM platform sign out'
  ],
  image: '/signout-og-image.jpg'
})

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