'use client'

import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { TangoHeader } from '@/components/app/tango-header'
import { FooterWithGrid } from '@/components/blocks/footers/footer-with-grid'

export default function AboutPageClient() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleJoinTango = async () => {
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      <TangoHeader />

      {/* Hero Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-800 sm:text-5xl font-[var(--font-display)]">
              About Tango
            </h1>
            <h2 className="text-2xl font-semibold text-slate-700 mt-4 mb-6">
              The CRM Built for the New Creative Economy
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600 leading-relaxed">
              Tango was born out of a simple realization: Traditional CRMs were never designed for creators. They were built for corporate sales teams — not the influencers, coaches, freelancers, and podcasters building modern businesses online.
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600 leading-relaxed">
              As the creator economy took off, so did the need for better tools. More people were making a living from content, community, and digital services — but juggling it all through spreadsheets, disconnected tools, and bloated platforms that didn't fit how creators actually work.
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600 leading-relaxed font-semibold">
              That's why we built Tango.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold text-slate-800 mb-6">
                Our Mission
              </h2>
              <p className="text-xl font-semibold text-slate-700 mb-6">
                To empower creators, freelancers, and online professionals with a CRM that actually fits how they work — flexible, lightweight, and powerful without the corporate clutter.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Tango gives you one place to:
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Track brand deals, clients, and sponsors</h3>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Organize content calendars and deliverables</h3>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Monitor revenue and grow your business</h3>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Run your creative empire like a real business</h3>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg text-slate-600 font-medium">
                No setup fees. No confusing features. Just your business, organized.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="text-3xl font-semibold text-slate-800 mb-6">
              Our Values
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Creator-First</h3>
              <p className="text-slate-600">
                We build for you, not the Fortune 500.
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Clarity Over Complexity</h3>
              <p className="text-slate-600">
                Every feature has a purpose.
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Freedom Through Simplicity</h3>
              <p className="text-slate-600">
                Tools should support your flow, not disrupt it.
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Respect for Your Time</h3>
              <p className="text-slate-600">
                Fast setup, clean UI, zero fluff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="text-3xl font-semibold text-slate-800 mb-6">
              Meet the Founder
            </h2>
            <p className="text-lg text-slate-600">
              A conversation with Steven Vitoratos, Founder of Tango
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Q: What made you want to create Tango?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    I kept seeing the same thing over and over again — creators, freelancers, and online coaches were building real businesses, but managing everything with spreadsheets, DMs, Notion boards, and scattered tools. Traditional CRMs didn't work for them. They were built for sales teams, not solo brands. I wanted to build something that actually fit the way they work.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Q: So what makes Tango different from other CRMs?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Tango is built specifically for the creator economy. It's not bloated. It doesn't assume you're managing a 20-person sales team. It's clean, intuitive, and focused on helping people track their brand deals, clients, content, and revenue — all in one place. We're not trying to be everything for everyone. We're just trying to be the best system for modern creative businesses.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Q: Who is Tango really for?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    It's for creators who are juggling brand deals, coaching clients, podcast sponsorships — basically anyone who runs their business online. If you've ever managed your work in a Google Sheet, juggled deadlines in your notes app, or forgotten to follow up with a brand in your DMs… Tango is for you.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Q: What's one thing you want users to feel when they use Tango?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Relief. Like, "finally." I want them to feel like they're not surviving anymore — they're in control. Organized. Focused. Like they finally have a system that understands their workflow.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Q: What's your vision for Tango long-term?</h3>
                  <p className="text-slate-600 leading-relaxed">
                    To become the go-to platform for solo entrepreneurs in the new economy. Not just a CRM — but a command center for creative businesses. I want it to grow with the user, whether they're just starting out or scaling into a full-time brand.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <blockquote className="text-xl font-semibold text-slate-800 italic">
                "CRMs were built for corporations. Tango was built for creators building empires from their phones and laptops."
              </blockquote>
              <p className="text-emerald-600 font-medium mt-2">— Steven Vitoratos</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-semibold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg text-emerald-100 mb-8">
              Join thousands of creators who are already using Tango to streamline their workflows and grow their businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleJoinTango}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-emerald-50 transition-colors"
              >
                Join Tango
              </button>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-emerald-700 transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>

      <FooterWithGrid />
    </div>
  )
} 