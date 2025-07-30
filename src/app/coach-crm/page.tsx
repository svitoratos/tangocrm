import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Star, Users, Target, TrendingUp, Calendar, DollarSign, Zap, GraduationCap, MessageSquare, Award } from 'lucide-react'
import { TangoHeader } from '@/components/app/tango-header'
import { FooterWithGrid } from '@/components/blocks/footers/footer-with-grid'

export const metadata: Metadata = generateMetadata({
  title: 'Coach CRM Platform - The #1 CRM for Life Coaches, Business Coaches & Online Coaches',
  description: 'Tango CRM is the leading coach CRM platform designed specifically for life coaches, business coaches, and online coaches. Manage clients, track sessions, and grow your coaching business.',
  keywords: [
    'coach CRM',
    'online coach CRM',
    'life coach CRM',
    'business coach CRM',
    'coaching CRM platform',
    'coach client management',
    'coaching session tracking',
    'coach business tools',
    'online coaching platform',
    'coach workflow management'
  ],
  image: '/coach-crm-og-image.jpg'
})

const features = [
  {
    icon: Users,
    title: 'Client Management',
    description: 'Track coaching clients, manage relationships, and organize client information with comprehensive profiles and progress tracking.'
  },
  {
    icon: Calendar,
    title: 'Session Scheduling',
    description: 'Schedule coaching sessions, manage availability, and send automated reminders to keep clients engaged and on track.'
  },
  {
    icon: MessageSquare,
    title: 'Communication Hub',
    description: 'Centralize all client communications, track follow-ups, and maintain coaching relationships in one organized system.'
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set and monitor client goals, track progress, and celebrate achievements with built-in milestone tracking.'
  },
  {
    icon: DollarSign,
    title: 'Revenue Management',
    description: 'Track coaching packages, manage payments, and monitor your coaching business revenue with detailed analytics.'
  },
  {
    icon: GraduationCap,
    title: 'Program Management',
    description: 'Manage different coaching programs, track client progress through programs, and scale your coaching offerings.'
  }
]

const testimonials = [
  {
    name: 'Jordan M.',
    role: 'Life Coach',
    content: 'Tango CRM has revolutionized my coaching practice. I can now focus on my clients instead of administrative tasks.',
    rating: 5
  },
  {
    name: 'Emma W.',
    role: 'Business Coach',
    content: 'Managing 50+ coaching clients was overwhelming until Tango CRM. Now everything is organized and I can scale my business.',
    rating: 5
  },
  {
    name: 'Ryan B.',
    role: 'Online Coach',
    content: 'As an online coach, I needed a system that could handle virtual sessions and digital client management. Tango CRM delivers perfectly.',
    rating: 4
  }
]

const faqs = [
  {
    question: 'How does Tango CRM help with client session management?',
    answer: 'Tango CRM provides comprehensive session management tools including scheduling, automated reminders, session notes, progress tracking, and follow-up management. You can track client progress over time, set session goals, and maintain detailed records of each coaching interaction.'
  },
  {
    question: 'Can I manage different types of coaching programs?',
    answer: 'Yes! Tango CRM is designed to handle multiple coaching programs simultaneously. Whether you offer 1-on-1 coaching, group programs, workshops, or online courses, you can organize clients by program type, track their progress through different offerings, and manage program-specific workflows.'
  },
  {
    question: 'How does Tango CRM support online coaching businesses?',
    answer: 'Tango CRM is built for the modern coaching business. It includes features for virtual session management, digital client onboarding, online payment processing, and remote client communication. Perfect for coaches who work with clients globally or offer online-only services.'
  },
  {
    question: 'Can I track client progress and coaching outcomes?',
    answer: 'Absolutely! Tango CRM includes robust progress tracking features that help you monitor client goals, track milestones, record session outcomes, and measure coaching effectiveness. You can also generate progress reports for clients and track your coaching business metrics.'
  }
]

export default function CoachCRMPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TangoHeader />
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              The #1 Coach CRM Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Built specifically for life coaches, business coaches, and online coaches. 
              Manage clients, track sessions, and grow your coaching business with tools designed for the coaching industry.
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
              Everything You Need to Scale Your Coaching Business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tango CRM provides all the tools you need to manage your coaching practice like a professional.
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
              Everything you need to grow your coaching business, starting at just $39.99/month
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
                       <span className="text-gray-700">Programs/content planning & scheduling</span>
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
              Loved by Coaches Worldwide
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
            Ready to Transform Your Coaching Business?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of coaches who are already using Tango CRM to streamline their practices and grow their businesses.
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