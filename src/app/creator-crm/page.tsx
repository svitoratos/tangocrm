import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Star, Users, Target, TrendingUp, Calendar, DollarSign, Zap } from 'lucide-react'
import { TangoHeader } from '@/components/app/tango-header'
import { FooterWithGrid } from '@/components/blocks/footers/footer-with-grid'

export const metadata: Metadata = generateMetadata({
  title: 'Creator CRM Platform - The #1 CRM for Content Creators & Influencers',
  description: 'Tango CRM is the leading creator CRM platform designed specifically for content creators, influencers, coaches, and freelancers. Manage brand deals, track revenue, and grow your creator business.',
  keywords: [
    'creator CRM platform',
    'best creator CRM',
    'influencer CRM platform',
    'content creator CRM',
    'CRM for creators',
    'CRM for influencers',
    'creator business management',
    'influencer management platform',
    'brand deals management',
    'creator workflow management'
  ],
  image: '/creator-crm-og-image.jpg'
})

const features = [
  {
    icon: Users,
    title: 'Client Management',
    description: 'Track leads, manage relationships, and close more brand deals with our comprehensive CRM tools designed for creators.'
  },
  {
    icon: DollarSign,
    title: 'Revenue Tracking',
    description: 'Monitor your income from brand deals, sponsorships, and client work with detailed analytics and reporting.'
  },
  {
    icon: Calendar,
    title: 'Content Calendar',
    description: 'Organize your content schedule, track deliverables, and never miss a deadline again.'
  },
  {
    icon: Target,
    title: 'Goal Setting',
    description: 'Set and track your business goals with detailed analytics and progress monitoring.'
  },
  {
    icon: TrendingUp,
    title: 'Analytics & Insights',
    description: 'Get deep insights into your business performance with real-time analytics and reporting.'
  },
  {
    icon: Zap,
    title: 'Multi-Niche Support',
    description: 'Specialized workflows for Content Creators, Coaches, Podcasters, and Freelancers.'
  }
]

const testimonials = [
  {
    name: 'Sarah C.',
    role: 'Content Creator',
    content: 'Tango CRM is the only platform that actually understands how creators work. It\'s like it was built specifically for me!',
    rating: 5
  },
  {
    name: 'Marcus R.',
    role: 'Podcaster',
    content: 'Managing sponsorships and brand deals has never been easier. Tango CRM keeps everything organized.',
    rating: 5
  },
  {
    name: 'Alex K.',
    role: 'Life Coach',
    content: 'As a coach, I needed a CRM that could handle my unique workflow. Tango CRM delivers exactly what I need.',
    rating: 4
  }
]

const faqs = [
  {
    question: 'What makes Tango CRM different from other CRM platforms?',
    answer: 'Tango CRM is built specifically for the creator economy. Unlike traditional CRMs designed for sales teams, Tango understands creator workflows, brand deal management, and the unique needs of content creators, influencers, coaches, and freelancers.'
  },
  {
    question: 'Can I manage multiple types of income streams?',
    answer: 'Yes! Tango CRM is designed to handle brand deals, sponsorships, coaching clients, freelance projects, and any other revenue streams creators typically have.'
  },
  {
    question: 'Is Tango CRM suitable for small creators just starting out?',
    answer: 'Absolutely! Tango CRM scales with your business. Whether you\'re just starting with your first brand deal or managing a full creator empire, our platform grows with you.'
  },
  {
    question: 'How does the multi-niche support work?',
    answer: 'Tango CRM offers specialized workflows for different creator types. Whether you\'re a content creator, coach, podcaster, or freelancer, you get tools and templates designed for your specific needs.'
  }
]

export default function CreatorCRMPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TangoHeader />
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              The #1 Creator CRM Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Built specifically for content creators, influencers, coaches, and freelancers. 
              Manage brand deals, track revenue, and grow your creator business with tools that actually fit how you work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  Join Tango
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>4.8/5 rating</span>
              </div>

              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No setup fees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale Your Creator Business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tango CRM provides all the tools you need to manage your creator business like a pro.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
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
                <p className="text-sm text-emerald-600 font-medium mt-2">✅ 15-day satisfaction guarantee — full refund if you're not happy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Loved by Creators Worldwide
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {faq.answer}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
                Join Tango
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" className="bg-emerald-800 text-white hover:bg-emerald-900 border border-emerald-700">
                Learn More About Tango CRM
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <FooterWithGrid />
    </div>
  )
} 