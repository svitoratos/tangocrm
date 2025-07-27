import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import AboutPageClient from '@/components/pages/about-page-client'

export const metadata: Metadata = generateMetadata({
  title: 'About Tango CRM - The CRM Built for Creators',
  description: 'Learn about Tango CRM, the CRM platform built specifically for creators, coaches, podcasters, and freelancers. Discover our mission to empower the creator economy with tools that actually fit how creators work.',
      keywords: [
      'about Tango CRM',
      'creator CRM company',
      'creator economy tools',
      'influencer management platform',
      'freelancer CRM software',
      'coach business tools',
      'podcaster management platform',
      'creator business software'
    ],
  image: '/about-og-image.jpg'
})

export default function AboutPage() {
  return <AboutPageClient />
} 