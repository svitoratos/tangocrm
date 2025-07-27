import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, ArrowRight, Check } from 'lucide-react'
import { TangoHeader } from '@/components/app/tango-header'
import { FooterWithGrid } from '@/components/blocks/footers/footer-with-grid'

export const metadata: Metadata = generateMetadata({
  title: 'Blog - Creator CRM Resources, Guides & Tips | Tango CRM',
  description: 'Discover expert insights, guides, and tips for creators, podcasters, coaches, and freelancers. Learn how to grow your creator business with Tango CRM.',
  keywords: [
    'creator CRM blog',
    'podcaster CRM guides',
    'coach CRM tips',
    'freelancer CRM resources',
    'creator business tips',
    'CRM for creators blog'
  ],
  image: '/blog-og-image.jpg'
})

const blogPosts = [
  {
    title: 'Complete Guide to Creator CRM Platforms: Choose the Best CRM for Your Creator Business',
    description: 'Discover the best creator CRM platforms for content creators, influencers, coaches, and freelancers. Learn what features to look for and how to choose the right CRM for your creator business.',
    href: '/blog/creator-crm-guide',
    category: 'Guides',
    readTime: '10 min read',
    date: '2025-01-26',
    featured: true
  },
  {
    title: 'Complete Guide to Podcaster CRM Platforms: Choose the Best CRM for Your Podcast Business',
    description: 'Discover the best podcaster CRM platforms for podcast hosts, audio creators, and podcast networks. Learn what features to look for and how to choose the right CRM for your podcast business.',
    href: '/blog/podcaster-crm-guide',
    category: 'Guides',
    readTime: '12 min read',
    date: '2025-01-26',
    featured: true
  }
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TangoHeader />
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Creator CRM Resources & Guides
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Expert insights, tips, and guides to help creators, podcasters, coaches, and freelancers grow their businesses with the right CRM tools.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Guides
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive guides to help you choose and implement the right CRM for your creator business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {blogPosts.map((post, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <span className="text-xs text-gray-500">•</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-xl leading-tight">
                    <Link href={post.href} className="hover:text-emerald-600 transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">
                    {post.description}
                  </CardDescription>
                  <Link href={post.href}>
                    <Button variant="outline" className="group">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Niche-Specific Landing Pages */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              CRM Solutions by Creator Type
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover specialized CRM platforms designed for your specific creator niche.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Content Creators</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Manage brand deals, track content performance, and grow your creator business.
                </CardDescription>
                <Link href="/creator-crm">
                  <Button size="sm" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Podcasters</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Manage guests, track sponsorships, and scale your podcast network.
                </CardDescription>
                <Link href="/podcaster-crm">
                  <Button size="sm" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Coaches</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Manage clients, track sessions, and grow your coaching practice.
                </CardDescription>
                <Link href="/coach-crm">
                  <Button size="sm" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Freelancers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Track projects, manage clients, and scale your freelance business.
                </CardDescription>
                <Link href="/freelancer-crm">
                  <Button size="sm" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                      <span className="text-gray-700">Calendar integration</span>
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Creator Business?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using Tango CRM to streamline their workflows and grow their businesses.
          </p>
                       <Link href="/sign-up">
               <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
                 Join Tango
               </Button>
             </Link>
        </div>
      </section>
      <FooterWithGrid />
    </div>
  )
} 