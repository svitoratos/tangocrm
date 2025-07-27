'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SplitWithScreenshot from '@/components/blocks/heros/split-with-screenshot'
import { FeaturesSectionBentoGrid } from '@/components/blocks/feature-sections/bento-grid'
import SimpleThreeColumnWithLargeIcons from '@/components/blocks/feature-sections/simple-three-column-with-large-icons'
import { WhyTangoComparison } from '@/components/blocks/feature-sections/why-tango-comparison'
import { PricingSection } from '@/components/blocks/pricing/tango-pricing'
import { TestimonialsGridWithCenteredCarousel } from '@/components/blocks/testimonials/testimonials-grid-with-centered-carousel'
import { TangoFaqs } from '@/components/blocks/faqs/tango-faqs'
import SimpleCenteredWithGradient from '@/components/blocks/ctas/simple-centered-with-gradient'
import { FooterWithGrid } from '@/components/blocks/footers/footer-with-grid'

export default function HomePageClient() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      // Check if user wants to bypass onboarding check (for testing)
      const urlParams = new URLSearchParams(window.location.search)
      const bypassOnboarding = urlParams.get('bypass')
      const goToApp = urlParams.get('go_to_app')
      
      console.log('Bypass parameter:', bypassOnboarding)
      console.log('Go to app parameter:', goToApp)
      
      if (bypassOnboarding === 'true') {
        console.log('Bypassing onboarding check - showing landing page')
        // Don't redirect, just show the landing page
        return
      }
      
      // Only check onboarding status if user explicitly wants to go to app
      if (goToApp === 'true') {
        console.log('User wants to go to app - checking onboarding status...')
        checkOnboardingStatus()
      } else {
        console.log('User on landing page - showing landing page')
        // Show landing page for authenticated users
        return
      }
    }
  }, [user, isLoaded])

  const checkOnboardingStatus = async () => {
    setIsCheckingOnboarding(true)
    try {
      const response = await fetch('/api/user/onboarding-status')
      if (response.ok) {
        const data = await response.json()
        
        if (data.hasCompletedOnboarding) {
          // User has completed onboarding, redirect to dashboard
          router.push(`/dashboard?niche=${data.primaryNiche || 'creator'}&section=crm`)
        } else {
          // User hasn't completed onboarding, redirect to onboarding
          router.push('/onboarding')
        }
      } else {
        // If there's an error checking status, redirect to onboarding as fallback
        router.push('/onboarding')
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      // On error, redirect to onboarding as fallback
      router.push('/onboarding')
    } finally {
      setIsCheckingOnboarding(false)
    }
  }

  // Show loading state while checking onboarding status
  if (isLoaded && user && isCheckingOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your experience...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <SplitWithScreenshot />
      <FeaturesSectionBentoGrid />
      <WhyTangoComparison />
      <SimpleThreeColumnWithLargeIcons />
      <PricingSection />
      <TestimonialsGridWithCenteredCarousel />
      <TangoFaqs />
      <SimpleCenteredWithGradient />
      <FooterWithGrid />
    </main>
  )
} 