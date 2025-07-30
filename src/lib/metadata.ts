import { Metadata } from 'next'

export const siteConfig = {
  name: 'Tango CRM',
  description: 'A comprehensive CRM platform designed for creators, coaches, podcasters, and freelancers. Manage brand deals, track revenue, and grow your creator business with tools built for the modern creator economy.',
  url: 'https://gotangocrm.com',
  ogImage: '/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/tangocrm',
    github: 'https://github.com/tangocrm',
  },
}

export const defaultMetadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.svg',
  },
  title: {
    default: `${siteConfig.name} - Creator CRM Platform`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'creator CRM platform',
    'creator CRM software',
    'best creator CRM',
    'influencer CRM platform',
    'content creator CRM',
    'freelancer CRM platform',
    'coach CRM platform',
    'podcaster CRM platform',
    'creator business management',
    'influencer management platform',
    'brand deals management',
    'content creator tools',
    'freelancer business tools',
    'coach business management',
    'podcaster tools',
    'creator economy platform',
    'social media management',
    'revenue tracking for creators',
    'client management for creators',
    'content calendar for creators',
    'influencer marketing tools',
    'content creator platform',
    'freelance business software',
    'coaching business software',
    'podcast management platform',
    'creator business tools',
    'CRM for creators',
    'CRM for influencers',
    'CRM for coaches',
    'CRM for freelancers',
    'CRM for podcasters',
    'creator management system',
    'influencer management system',
    'brand deal tracking',
    'sponsorship management',
    'creator workflow management'
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - Creator CRM Platform`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Creator CRM Platform`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} - Creator CRM Platform`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@tangocrm',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
    yandex: process.env.YANDEX_VERIFICATION_CODE,
    yahoo: process.env.YAHOO_VERIFICATION_CODE,
  },
}

export function generateMetadata({
  title,
  description,
  keywords,
  image,
  noIndex = false,
}: {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  }
}

export const structuredData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: 'The leading CRM platform for creators, influencers, coaches, and freelancers',
    sameAs: [
      siteConfig.links.twitter,
      siteConfig.links.github,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${siteConfig.url}/contact`,
    },
  },
  softwareApplication: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${siteConfig.name} - Creator CRM Platform`,
    description: siteConfig.description,
    url: siteConfig.url,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Customer Relationship Management',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    featureList: [
      'Brand Deal Management',
      'Client Relationship Management',
      'Revenue Tracking',
      'Content Calendar',
      'Goal Setting & Analytics',
      'Multi-Niche Support',
      'Stripe Integration',
      'Mobile Responsive'
    ],
    offers: {
      '@type': 'Offer',
      price: '39.99',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
      url: `${siteConfig.url}/pricing`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Content Creator'
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5'
        },
        reviewBody: 'Finally, a CRM that understands how creators work!'
      }
    ],
  },
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: 'The ultimate CRM platform for creators, influencers, coaches, and freelancers',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
  faq: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a creator CRM platform?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A creator CRM platform is a customer relationship management system specifically designed for content creators, influencers, coaches, and freelancers to manage their business operations, track brand deals, and grow their creator business.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is Tango CRM the best creator CRM platform?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Tango CRM is designed specifically for the creator economy with features that traditional CRMs lack, including brand deal management, content calendar integration, and creator-specific workflows.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does Tango CRM cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tango CRM starts at $39.99/month. No setup fees, cancel anytime.'
        }
      }
    ]
  }
} 