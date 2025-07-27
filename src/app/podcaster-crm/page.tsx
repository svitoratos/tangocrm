import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Star, Users, Target, TrendingUp, Calendar, DollarSign, Zap, Mic, Headphones, Radio } from 'lucide-react'
import { TangoHeader } from '@/components/app/tango-header'
import { FooterWithGrid } from '@/components/blocks/footers/footer-with-grid'

export const metadata: Metadata = generateMetadata({
  title: 'Podcaster CRM Platform - The #1 CRM for Podcast Hosts & Audio Creators',
  description: 'Tango CRM is the leading podcaster CRM platform designed specifically for podcast hosts, audio creators, and podcast networks. Manage sponsorships, track guests, and grow your podcast business.',
  keywords: [
    'podcaster CRM',
    'podcast CRM platform',
    'podcast host CRM',
    'audio creator CRM',
    'podcast sponsorship management',
    'podcast guest management',
    'podcast business tools',
    'podcast revenue tracking',
    'podcast network CRM',
    'podcast workflow management'
  ],
  image: '/podcaster-crm-og-image.jpg'
})

const features = [
  {
    icon: Mic,
    title: 'Guest Management',
    description: 'Track potential guests, manage interview schedules, and never lose contact with industry experts and thought leaders.'
  },
  {
    icon: DollarSign,
    title: 'Sponsorship Tracking',
    description: 'Manage podcast sponsorships, track ad revenue, and monitor sponsorship campaign performance with detailed analytics.'
  },
  {
    icon: Calendar,
    title: 'Episode Planning',
    description: 'Plan your podcast episodes, track recording schedules, and manage content calendars for multiple shows.'
  },
  {
    icon: Headphones,
    title: 'Audio Production',
    description: 'Track production workflows, manage editing deadlines, and coordinate with audio engineers and producers.'
  },
  {
    icon: TrendingUp,
    title: 'Podcast Analytics',
    description: 'Monitor listener growth, track episode performance, and analyze audience engagement metrics.'
  },
  {
    icon: Radio,
    title: 'Multi-Show Management',
    description: 'Manage multiple podcasts, coordinate cross-promotion, and scale your podcast network efficiently.'
  }
]

const testimonials = [
  {
    name: 'Jessica T.',
    role: 'Tech Podcast Host',
    content: 'Tango CRM has transformed how I manage my podcast. From guest scheduling to sponsorship tracking, everything is finally organized!',
    rating: 4
  },
  {
    name: 'David P.',
    role: 'Business Podcast Network Owner',
    content: 'Managing 5 different podcasts was chaos until Tango CRM. Now everything runs smoothly and I can focus on content creation.',
    rating: 5
  },
  {
    name: 'Maria S.',
    role: 'Indie Podcast Creator',
    content: 'As a solo podcaster, I needed something simple but powerful. Tango CRM gives me enterprise-level tools without the complexity.',
    rating: 5
  }
]

const faqs = [
  {
    question: 'How does Tango CRM help with podcast guest management?',
    answer: 'Tango CRM provides a complete guest management system where you can track potential guests, manage interview schedules, store contact information, and follow up with guests automatically. You can also categorize guests by expertise, track interview outcomes, and build a database of repeat guests.'
  },
  {
    question: 'Can I track podcast sponsorships and ad revenue?',
    answer: 'Absolutely! Tango CRM includes specialized sponsorship tracking features that help you manage sponsor relationships, track ad revenue, monitor campaign performance, and ensure timely deliverables. You can also track sponsorship renewals and upsell opportunities.'
  },
  {
    question: 'Is Tango CRM suitable for podcast networks with multiple shows?',
    answer: 'Yes! Tango CRM is designed to scale with your podcast business. Whether you have one show or a network of podcasts, our platform helps you manage multiple shows, coordinate cross-promotion, and track performance across your entire podcast portfolio.'
  },
  {
    question: 'How does Tango CRM integrate with podcast production workflows?',
    answer: 'Tango CRM helps you manage the entire podcast production process, from initial planning to episode release. Track recording schedules, manage editing deadlines, coordinate with audio engineers, and ensure all team members stay on the same page.'
  }
]

export default function PodcasterCRMPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TangoHeader />
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              The #1 Podcaster CRM Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Built specifically for podcast hosts, audio creators, and podcast networks. 
              Manage guests, track sponsorships, and grow your podcast business with tools designed for the audio industry.
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
                <Users className="w-4 h-4" />
                <span>500+ podcasters</span>
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
              Everything You Need to Scale Your Podcast Business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tango CRM provides all the tools you need to manage your podcast like a professional network.
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
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Loved by Podcasters Worldwide
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
            Ready to Transform Your Podcast Business?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of podcasters who are already using Tango CRM to streamline their workflows and grow their shows.
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