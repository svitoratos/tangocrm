import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import PricingPageClient from '@/components/pages/pricing-page-client'

export const metadata: Metadata = generateMetadata({
  title: 'Pricing - Creator CRM Plans for Influencers, Coaches & Freelancers',
  description: 'Choose the perfect Tango CRM plan for your creator business. Starting at $39.99/month. No setup fees, cancel anytime. 15-day satisfaction guarantee. Built for creators, coaches, podcasters, and freelancers.',
  keywords: [
    'creator CRM pricing',
    'influencer management cost',
    'freelancer CRM pricing',
    'coach business software pricing',
    'podcaster tools pricing',
    'creator economy software cost',
    'brand deal management pricing',
    'content creator CRM pricing'
  ],
  image: '/pricing-og-image.jpg'
})

export default function PricingPage() {
  return <PricingPageClient />
} 