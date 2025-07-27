import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import HomePageClient from '@/components/pages/home-page-client'

export const metadata: Metadata = generateMetadata({
  title: 'Best Creator CRM Platform for Influencers, Coaches & Freelancers | Tango CRM',
  description: 'Tango CRM is the #1 creator CRM platform for influencers, coaches, podcasters, and freelancers. Manage brand deals, track revenue, organize content, and grow your creator business. Join Tango today!',
  keywords: [
    'creator CRM platform',
    'best creator CRM',
    'influencer CRM platform',
    'content creator CRM',
    'freelancer CRM platform',
    'coach CRM platform',
    'podcaster CRM platform',
    'creator business management',
    'influencer management platform',
    'brand deals management',
    'CRM for creators',
    'CRM for influencers',
    'CRM for coaches',
    'CRM for freelancers',
    'CRM for podcasters'
  ],
  image: '/og-image.jpg'
})

export default function HomePage() {
  return <HomePageClient />
}