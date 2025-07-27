import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/admin/',
        '/api/',
        '/onboarding/',
        '/signin/',
        '/signup/',
        '/sign-in/',
        '/sign-up/',
        '/signout/',
        '/test-',
      ],
    },
    sitemap: 'https://gotangocrm.com/sitemap.xml',
  }
} 