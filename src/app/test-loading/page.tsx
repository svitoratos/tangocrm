"use client";

import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import React from 'react';
import { useRouter } from 'next/navigation';
import { PostSignupLoading } from '@/components/app/post-signup-loading';

export const metadata: Metadata = generateMetadata({
  title: 'Test Loading - Tango CRM',
  description: 'Test page for Tango CRM loading components and post-signup flow. Internal testing page for the creator CRM platform.',
  keywords: [
    'Tango CRM test',
    'creator CRM testing',
    'CRM platform test',
    'Tango CRM loading test',
    'creator business test',
    'CRM platform testing',
    'Tango CRM development'
  ],
  image: '/test-og-image.jpg'
})

export default function TestLoadingPage() {
  const router = useRouter();

  const handleSetupComplete = () => {
    console.log('Setup complete, redirecting to dashboard...');
    router.push('/dashboard?test=true');
  };

  return (
    <PostSignupLoading 
      userName="Creator"
      selectedRoles={["Content Creator", "Coach"]}
      selectedGoals={["Build a community", "Monetize content"]}
      setupTask="Set up your first campaign"
      onSetupComplete={handleSetupComplete}
    />
  );
} 