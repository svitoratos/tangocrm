"use client";
import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminOnly({ children, fallback }: AdminOnlyProps) {
  const { isAdmin, isLoaded } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return fallback || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 