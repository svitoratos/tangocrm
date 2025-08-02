"use client";

import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import { Suspense } from 'react';
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { StaticDashboardBackground } from "@/components/app/static-dashboard-background";

export const metadata: Metadata = generateMetadata({
  title: 'Sign Up - Join Tango CRM Creator Platform',
  description: 'Join Tango CRM and transform your creator business. Sign up for the leading CRM platform designed for creators, coaches, podcasters, and freelancers.',
  keywords: [
    'Tango CRM sign up',
    'join creator CRM',
    'CRM platform registration',
    'creator business signup',
    'Tango CRM free trial',
    'creator tools signup',
    'CRM platform join'
  ],
  image: '/signup-og-image.jpg'
})

function SignUpWithSearchParams() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/onboarding';

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Dashboard Background */}
      <div className="absolute inset-0 z-0">
        <StaticDashboardBackground />
      </div>
      
      {/* Blur Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-black/50"
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
      />
      
      {/* Sign Up Form */}
      <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Join Tango
            </h1>
            <p className="text-white/80">
              Join Tango and transform your creator business
            </p>
          </div>
          
          <div className="flex justify-center">
            <SignUp 
              fallbackRedirectUrl={redirectUrl}
              appearance={{
                elements: {
                  formButtonPrimary: "bg-emerald-500 hover:bg-emerald-600 text-white",
                  card: "bg-white/95 border border-white/20 shadow-2xl w-full",
                  headerTitle: "text-slate-800",
                  headerSubtitle: "text-slate-600",
                  socialButtonsBlockButton: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
                  formFieldLabel: "text-slate-700",
                  formFieldInput: "bg-white border border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500",
                  footerActionLink: "text-emerald-500 hover:text-emerald-600",
                  rootBox: "w-full flex justify-center",
                },
                layout: {
                  unsafe_disableDevelopmentModeWarnings: true,
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <StaticDashboardBackground />
      </div>
      <div 
        className="absolute inset-0 z-0 bg-black/50"
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
      />
      <div className="relative z-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignUpWithSearchParams />
    </Suspense>
  );
} 