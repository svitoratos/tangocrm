"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function SimpleCenteredWithGradient() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleJoinTango = () => {
    if (isSignedIn) {
      // User is already signed in, go to app
      router.push('/?go_to_app=true');
    } else {
      // User needs to sign up first
      // Redirect to Clerk's sign-up page
      const signUpUrl = `/signup`;
      router.push(signUpUrl);
    }
  };

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      <div className="px-6 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-slate-800 sm:text-5xl font-[var(--font-display)]">
            Ready to Transform Your Business?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg/8 text-pretty text-slate-600">
            Join thousands of creators, coaches, and freelancers who've streamlined their client relationships.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <button
              onClick={handleJoinTango}
              className="rounded-md bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 transition-colors"
            >
              Join Tango
            </button>
            <a href="/about" className="text-sm font-semibold text-orange-600 hover:text-orange-500 transition-colors">
              Learn More <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
        <svg
          viewBox="0 0 1024 1024"
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -z-10 size-256 -translate-x-1/2 mask-[radial-gradient(closest-side,white,transparent)]"
        >
          <circle r={512} cx={512} cy={512} fill="url(#emerald-orange-gradient)" fillOpacity="0.3" />
          <defs>
            <radialGradient id="emerald-orange-gradient">
              <stop stopColor="#10b981" />
              <stop offset={1} stopColor="#f97316" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    )
  }