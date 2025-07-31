'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function ContentStagePage() {
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const niche = searchParams.get('niche') || 'creator';

  useEffect(() => {
    // Redirect to the idea stage for the current niche
    router.push(`/dashboard/content-stage/idea?niche=${niche}`);
  }, [router, niche]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Content Hub...</p>
      </div>
    </div>
  );
} 