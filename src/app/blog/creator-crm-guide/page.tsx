import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { TangoHeader } from '@/components/app/tango-header'
import { FooterWithGrid } from '@/components/blocks/footers/footer-with-grid'

export const metadata: Metadata = generateMetadata({
  title: 'Complete Guide to Creator CRM Platforms: Choose the Best CRM for Your Creator Business',
  description: 'Discover the best creator CRM platforms for content creators, influencers, coaches, and freelancers. Learn what features to look for and how to choose the right CRM for your creator business.',
  keywords: [
    'creator CRM guide',
    'best creator CRM platforms',
    'how to choose creator CRM',
    'CRM for content creators',
    'influencer CRM comparison',
    'creator business management tools',
    'brand deal management CRM',
    'creator workflow management'
  ],
  image: '/creator-crm-guide-og-image.jpg'
})

export default function CreatorCRMGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <TangoHeader />
      <article className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Complete Guide to Creator CRM Platforms: Choose the Best CRM for Your Creator Business
          </h1>
          <div className="flex items-center gap-4 text-gray-600 mb-8">
            <span>By Tango CRM Team</span>
            <span>•</span>
            <span>10 min read</span>
          </div>
          <p className="text-xl text-gray-600 leading-relaxed">
            As the creator economy continues to grow, more and more content creators, influencers, coaches, and freelancers are realizing they need a proper CRM system to manage their business operations. But with so many options available, how do you choose the right creator CRM platform for your needs?
          </p>
        </header>

        {/* Table of Contents */}
        <nav className="bg-gray-50 p-6 rounded-lg mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            <li><a href="#what-is-creator-crm" className="text-emerald-600 hover:text-emerald-700">What is a Creator CRM Platform?</a></li>
            <li><a href="#why-creators-need-crm" className="text-emerald-600 hover:text-emerald-700">Why Do Creators Need a CRM?</a></li>
            <li><a href="#key-features" className="text-emerald-600 hover:text-emerald-700">Key Features to Look For</a></li>
            <li><a href="#choosing-right-crm" className="text-emerald-600 hover:text-emerald-700">How to Choose the Right Creator CRM</a></li>
            <li><a href="#tango-crm-advantage" className="text-emerald-600 hover:text-emerald-700">Why Tango CRM is the Best Choice</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <section id="what-is-creator-crm" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Creator CRM Platform?</h2>
          <p className="text-lg text-gray-700 mb-4">
            A Creator CRM (Customer Relationship Management) platform is a specialized software system designed specifically for content creators, influencers, coaches, and freelancers to manage their business relationships and operations.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            Unlike traditional CRMs that are built for sales teams and corporations, creator CRM platforms understand the unique workflows and needs of the creator economy. They help you manage brand deals, track client relationships, organize content calendars, and monitor your business growth.
          </p>
        </section>

        <section id="why-creators-need-crm" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Do Creators Need a CRM?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">The Creator Economy Challenge</h3>
              <p className="text-gray-700 mb-4">
                As a creator, you're juggling multiple income streams: brand deals, sponsorships, coaching clients, affiliate marketing, and more. Without a proper system, it's easy to lose track of opportunities, miss deadlines, and leave money on the table.
              </p>
              <p className="text-gray-700">
                Traditional business tools weren't designed for creators. Spreadsheets become unwieldy, email threads get lost, and important follow-ups fall through the cracks.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">The Solution: Creator CRM</h3>
              <p className="text-gray-700 mb-4">
                A creator CRM platform provides a centralized hub for all your business operations. It helps you:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Track brand deals and sponsorship opportunities</li>
                <li>Manage client relationships and communications</li>
                <li>Organize content calendars and deliverables</li>
                <li>Monitor revenue and business growth</li>
                <li>Automate follow-ups and reminders</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="key-features" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features to Look For in a Creator CRM</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Brand Deal Management</h3>
              <p className="text-gray-700 mb-4">
                Look for a CRM that can track brand deals from initial contact to completion. This should include:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Deal pipeline management</li>
                <li>Contract tracking and storage</li>
                <li>Payment tracking and invoicing</li>
                <li>Performance metrics and reporting</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Client Relationship Management</h3>
              <p className="text-gray-700 mb-4">
                A good creator CRM should help you build and maintain relationships with:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Brand partners and sponsors</li>
                <li>Coaching clients</li>
                <li>Collaboration partners</li>
                <li>Fans and community members</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Content Calendar Integration</h3>
              <p className="text-gray-700 mb-4">
                Your CRM should integrate with your content workflow, helping you:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Schedule content and deliverables</li>
                <li>Track project deadlines</li>
                <li>Manage multiple content types</li>
                <li>Coordinate with team members</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Analytics and Reporting</h3>
              <p className="text-gray-700 mb-4">
                Comprehensive analytics help you understand your business performance:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Revenue tracking and forecasting</li>
                <li>Client acquisition and retention metrics</li>
                <li>Content performance analysis</li>
                <li>Business growth insights</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="choosing-right-crm" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Choose the Right Creator CRM</h2>
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Evaluation Checklist</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Must-Have Features:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Brand deal tracking</li>
                  <li>✓ Client management</li>
                  <li>✓ Content calendar</li>
                  <li>✓ Revenue tracking</li>
                  <li>✓ Mobile accessibility</li>
                  <li>✓ Integration capabilities</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Consider Your Needs:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Creator type (influencer, coach, podcaster, etc.)</li>
                  <li>• Business size and growth stage</li>
                  <li>• Budget and pricing model</li>
                  <li>• Team collaboration needs</li>
                  <li>• Technical requirements</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="tango-crm-advantage" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Tango CRM is the Best Choice for Creators</h2>
          <div className="bg-emerald-50 p-8 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Built Specifically for the Creator Economy</h3>
            <p className="text-gray-700 mb-6">
              Tango CRM was designed from the ground up for creators, by creators. We understand the unique challenges and workflows of the creator economy, which is why our platform includes features that traditional CRMs simply don't offer.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Creator-Specific Features:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Multi-niche support (Creators, Coaches, Podcasters, Freelancers)</li>
                  <li>• Brand deal pipeline management</li>
                  <li>• Sponsorship tracking and analytics</li>
                  <li>• Content calendar integration</li>
                  <li>• Revenue split calculations</li>
                  <li>• Creator-specific templates and workflows</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Why Creators Choose Tango CRM:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Intuitive, creator-friendly interface</li>
                  <li>• No steep learning curve</li>
                  <li>• Scales with your business</li>
                  <li>• Affordable pricing for creators</li>
                  <li>• Excellent customer support</li>
                  <li>• Regular updates and new features</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-slate-50 p-8 rounded-lg mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to grow your creator business, starting at just $39.99/month
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Tango Core</h3>
                <div className="text-4xl font-bold text-emerald-600 mb-2">$39.99</div>
                <p className="text-gray-600">per month</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-4">What's Included:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700">Unlimited clients & opportunities</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700">Content planning & scheduling</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700">Goal tracking & analytics</span>
                    </li>
                                         <li className="flex items-center gap-3">
                       <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                       <span className="text-gray-700">Calendar management</span>
                     </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Plus:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700">Journal & reflection tools</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700">Email support</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700">Mobile responsive dashboard</span>
                    </li>

                  </ul>
                </div>
              </div>
              
              <div className="text-center">
                                 <Link href="/sign-up">
                   <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto">
                     Join Tango
                   </Button>
                 </Link>
                <p className="text-sm text-gray-500 mt-4">No setup fees • Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-emerald-600 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Transform Your Creator Business?
          </h2>
          <p className="text-emerald-100 mb-6">
            Join thousands of creators who are already using Tango CRM to streamline their workflows and grow their businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                           <Link href="/sign-up">
                 <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
                   Join Tango
                 </Button>
               </Link>
            <Link href="/creator-crm">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
                Learn More About Tango CRM
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 text-center">
            This guide is part of Tango CRM's commitment to helping creators succeed in the digital economy. 
            For more resources and tips, visit our <Link href="/blog" className="text-emerald-600 hover:text-emerald-700">blog</Link>.
          </p>
        </footer>
      </article>
      <FooterWithGrid />
    </div>
  )
} 