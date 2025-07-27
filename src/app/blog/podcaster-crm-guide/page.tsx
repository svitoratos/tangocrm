import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { TangoHeader } from '@/components/app/tango-header'
import { FooterWithGrid } from '@/components/blocks/footers/footer-with-grid'

export const metadata: Metadata = generateMetadata({
  title: 'Complete Guide to Podcaster CRM Platforms: Choose the Best CRM for Your Podcast Business',
  description: 'Discover the best podcaster CRM platforms for podcast hosts, audio creators, and podcast networks. Learn what features to look for and how to choose the right CRM for your podcast business.',
  keywords: [
    'podcaster CRM guide',
    'best podcaster CRM platforms',
    'how to choose podcaster CRM',
    'CRM for podcast hosts',
    'podcast CRM comparison',
    'podcast business management tools',
    'podcast sponsorship management CRM',
    'podcast workflow management'
  ],
  image: '/podcaster-crm-guide-og-image.jpg'
})

export default function PodcasterCRMGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <TangoHeader />
      <article className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Complete Guide to Podcaster CRM Platforms: Choose the Best CRM for Your Podcast Business
          </h1>
          <div className="flex items-center gap-4 text-gray-600 mb-8">
            <span>By Tango CRM Team</span>
            <span>•</span>
            <span>Updated: {new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>12 min read</span>
          </div>
          <p className="text-xl text-gray-600 leading-relaxed">
            As the podcasting industry continues to explode, more and more podcast hosts, audio creators, and podcast networks are realizing they need a proper CRM system to manage their business operations. But with so many options available, how do you choose the right podcaster CRM platform for your needs?
          </p>
        </header>

        {/* Table of Contents */}
        <nav className="bg-gray-50 p-6 rounded-lg mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <ul className="space-y-2">
            <li><a href="#what-is-podcaster-crm" className="text-emerald-600 hover:text-emerald-700">What is a Podcaster CRM Platform?</a></li>
            <li><a href="#why-podcasters-need-crm" className="text-emerald-600 hover:text-emerald-700">Why Do Podcasters Need a CRM?</a></li>
            <li><a href="#key-features" className="text-emerald-600 hover:text-emerald-700">Key Features to Look For</a></li>
            <li><a href="#choosing-right-crm" className="text-emerald-600 hover:text-emerald-700">How to Choose the Right Podcaster CRM</a></li>
            <li><a href="#tango-crm-advantage" className="text-emerald-600 hover:text-emerald-700">Why Tango CRM is the Best Choice</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <section id="what-is-podcaster-crm" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Podcaster CRM Platform?</h2>
          <p className="text-lg text-gray-700 mb-4">
            A Podcaster CRM (Customer Relationship Management) platform is a specialized software system designed specifically for podcast hosts, audio creators, and podcast networks to manage their business relationships and operations.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            Unlike traditional CRMs that are built for sales teams and corporations, podcaster CRM platforms understand the unique workflows and needs of the podcasting industry. They help you manage guest relationships, track sponsorships, organize episode production, and monitor your podcast business growth.
          </p>
        </section>

        <section id="why-podcasters-need-crm" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Do Podcasters Need a CRM?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">The Podcasting Challenge</h3>
              <p className="text-gray-700 mb-4">
                As a podcaster, you're juggling multiple responsibilities: guest booking, sponsorship management, episode production, audience engagement, and business growth. Without a proper system, it's easy to lose track of opportunities, miss deadlines, and leave money on the table.
              </p>
              <p className="text-gray-700">
                Traditional business tools weren't designed for podcasters. Spreadsheets become unwieldy, email threads get lost, and important follow-ups fall through the cracks.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">The Solution: Podcaster CRM</h3>
              <p className="text-gray-700 mb-4">
                A podcaster CRM platform provides a centralized hub for all your podcast operations. It helps you:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Track guest relationships and booking schedules</li>
                <li>Manage sponsorship opportunities and campaigns</li>
                <li>Organize episode production workflows</li>
                <li>Monitor podcast performance and growth</li>
                <li>Automate follow-ups and reminders</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="key-features" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features to Look For in a Podcaster CRM</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Guest Management</h3>
              <p className="text-gray-700 mb-4">
                Look for a CRM that can track potential guests, manage interview schedules, and maintain guest relationships. This should include:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Guest database with contact information</li>
                <li>Interview scheduling and calendar integration</li>
                <li>Guest categorization by expertise and industry</li>
                <li>Follow-up automation and relationship tracking</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Sponsorship Management</h3>
              <p className="text-gray-700 mb-4">
                A good podcaster CRM should help you manage sponsor relationships and track revenue:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Sponsor contact and relationship management</li>
                <li>Sponsorship campaign tracking</li>
                <li>Ad revenue monitoring and reporting</li>
                <li>Contract and deliverable management</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Episode Production Workflow</h3>
              <p className="text-gray-700 mb-4">
                Your CRM should integrate with your production process, helping you:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Plan episode schedules and content calendars</li>
                <li>Track recording and editing deadlines</li>
                <li>Manage production team coordination</li>
                <li>Monitor episode release schedules</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Analytics and Performance Tracking</h3>
              <p className="text-gray-700 mb-4">
                Comprehensive analytics help you understand your podcast performance:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Listener growth and engagement metrics</li>
                <li>Episode performance analysis</li>
                <li>Revenue and sponsorship tracking</li>
                <li>Audience demographics and insights</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="choosing-right-crm" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Choose the Right Podcaster CRM</h2>
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Evaluation Checklist</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Must-Have Features:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Guest management system</li>
                  <li>✓ Sponsorship tracking</li>
                  <li>✓ Episode production workflow</li>
                  <li>✓ Analytics and reporting</li>
                  <li>✓ Calendar integration</li>
                  <li>✓ Mobile accessibility</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Consider Your Needs:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Podcast type (interview, solo, narrative, etc.)</li>
                  <li>• Business size and growth stage</li>
                  <li>• Budget and pricing model</li>
                  <li>• Team collaboration needs</li>
                  <li>• Integration requirements</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="tango-crm-advantage" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Tango CRM is the Best Choice for Podcasters</h2>
          <div className="bg-emerald-50 p-8 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Built Specifically for the Podcasting Industry</h3>
            <p className="text-gray-700 mb-6">
              Tango CRM was designed from the ground up for podcasters, by podcasters. We understand the unique challenges and workflows of the podcasting industry, which is why our platform includes features that traditional CRMs simply don't offer.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Podcaster-Specific Features:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Guest relationship management</li>
                  <li>• Sponsorship campaign tracking</li>
                  <li>• Episode production workflow</li>
                  <li>• Podcast analytics integration</li>
                  <li>• Multi-show management</li>
                  <li>• Audio industry templates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Why Podcasters Choose Tango CRM:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Intuitive, podcaster-friendly interface</li>
                  <li>• No steep learning curve</li>
                  <li>• Scales with your podcast business</li>
                  <li>• Affordable pricing for podcasters</li>
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
              Everything you need to grow your podcast business, starting at just $39.99/month
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
                       <span className="text-gray-700">Unlimited guests/clients & opportunities</span>
                     </li>
                                         <li className="flex items-center gap-3">
                       <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                       <span className="text-gray-700">Episode/content planning & scheduling</span>
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
            Ready to Transform Your Podcast Business?
          </h2>
          <p className="text-emerald-100 mb-6">
            Join hundreds of podcasters who are already using Tango CRM to streamline their workflows and grow their shows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                           <Link href="/sign-up">
                 <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
                   Join Tango
                 </Button>
               </Link>
            <Link href="/podcaster-crm">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
                Learn More About Tango CRM
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 text-center">
            This guide is part of Tango CRM's commitment to helping podcasters succeed in the audio industry. 
            For more resources and tips, visit our <Link href="/blog" className="text-emerald-600 hover:text-emerald-700">blog</Link>.
          </p>
        </footer>
      </article>
      <FooterWithGrid />
    </div>
  )
} 