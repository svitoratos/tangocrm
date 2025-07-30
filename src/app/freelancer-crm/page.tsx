import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Star, Users, Target, TrendingUp, Calendar, DollarSign, Zap, Briefcase, FileText, Clock } from 'lucide-react'
import { TangoHeader } from '@/components/app/tango-header'
import { FooterWithGrid } from '@/components/blocks/footers/footer-with-grid'

export const metadata: Metadata = generateMetadata({
  title: 'Freelancer CRM Platform - The #1 CRM for Freelancers, Consultants & Independent Professionals',
  description: 'Tango CRM is the leading freelancer CRM platform designed specifically for freelancers, consultants, and independent professionals. Manage clients, track projects, and grow your freelance business.',
  keywords: [
    'freelancer CRM',
    'consultant CRM',
    'freelance CRM platform',
    'independent consultant CRM',
    'freelancer client management',
    'freelance project tracking',
    'consultant business tools',
    'freelance workflow management',
    'independent professional CRM',
    'freelance business management'
  ],
  image: '/freelancer-crm-og-image.jpg'
})

const features = [
  {
    icon: Briefcase,
    title: 'Client Management',
    description: 'Track freelance clients, manage relationships, and organize client information with comprehensive profiles and project history.'
  },
  {
    icon: FileText,
    title: 'Project Tracking',
    description: 'Manage freelance projects from proposal to completion, track deadlines, and monitor project progress in real-time.'
  },
  {
    icon: Clock,
    title: 'Time Management',
    description: 'Track billable hours, manage project timelines, and ensure you\'re maximizing your productivity and profitability.'
  },
  {
    icon: DollarSign,
    title: 'Financial Management',
    description: 'Track invoices, manage payments, monitor cash flow, and get insights into your freelance business finances.'
  },
  {
    icon: Target,
    title: 'Lead Management',
    description: 'Track potential clients, manage proposals, and convert prospects into paying clients with organized follow-up systems.'
  },
  {
    icon: TrendingUp,
    title: 'Business Analytics',
    description: 'Monitor your freelance business performance, track revenue trends, and make data-driven decisions to grow your business.'
  }
]

const testimonials = [
  {
    name: 'Lisa Z.',
    role: 'Web Developer',
    content: 'Tango CRM has transformed my freelance business. I can now track projects, manage clients, and focus on what I do best - coding.',
    rating: 4
  },
  {
    name: 'Carlos R.',
    role: 'Marketing Consultant',
    content: 'Managing multiple client projects was chaos until Tango CRM. Now everything is organized and I can scale my consulting business.',
    rating: 5
  },
  {
    name: 'Sofia A.',
    role: 'Graphic Designer',
    content: 'As a freelancer, I needed something simple but powerful. Tango CRM gives me enterprise-level tools without the complexity.',
    rating: 5
  }
]

const faqs = [
  {
    question: 'How does Tango CRM help with freelance project management?',
    answer: 'Tango CRM provides comprehensive project management tools including project tracking, deadline management, client communication, file sharing, and progress monitoring. You can track projects from initial proposal through completion, manage multiple projects simultaneously, and ensure nothing falls through the cracks.'
  },

  {
    question: 'How does Tango CRM support different types of freelancers?',
    answer: 'Tango CRM is designed to work for all types of freelancers and consultants - from web developers and designers to writers, marketers, consultants, and more. The platform is flexible enough to adapt to your specific workflow while providing the essential tools every freelancer needs to manage their business.'
  },
  {
    question: 'Can I manage multiple clients and projects efficiently?',
    answer: 'Absolutely! Tango CRM is built to handle multiple clients and projects simultaneously. You can organize clients by industry, project type, or any other criteria that makes sense for your business. The platform helps you prioritize work, manage deadlines, and ensure you\'re giving each client the attention they deserve.'
  }
]

export default function FreelancerCRMPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TangoHeader />
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              The #1 Freelancer CRM Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Built specifically for freelancers, consultants, and independent professionals. 
              Manage clients, track projects, and grow your freelance business with tools designed for the gig economy.
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
              Everything You Need to Scale Your Freelance Business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tango CRM provides all the tools you need to manage your freelance business like a professional agency.
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
              Everything you need to grow your freelancing business, starting at just $39.99/month
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
                       <span className="text-gray-700">Projects/content planning & scheduling</span>
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
              Loved by Freelancers Worldwide
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
            Ready to Transform Your Freelance Business?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of freelancers who are already using Tango CRM to streamline their workflows and grow their businesses.
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