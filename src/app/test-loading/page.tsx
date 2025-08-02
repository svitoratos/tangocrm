"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { PostSignupLoading } from '@/components/app/post-signup-loading';

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