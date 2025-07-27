import { useCallback } from 'react'
import { trackEvent, trackPageView, trackConversion, trackEngagement } from '@/components/analytics/google-analytics'

export const useGoogleAnalytics = () => {
  const trackPageViewEvent = useCallback((url: string) => {
    trackPageView(url)
  }, [])

  const trackButtonClick = useCallback((buttonName: string, page?: string) => {
    trackEvent('click', 'button', buttonName)
    if (page) {
      trackEvent('page_interaction', 'navigation', `${page}_${buttonName}`)
    }
  }, [])

  const trackFormSubmission = useCallback((formName: string, success: boolean) => {
    trackEvent('form_submit', 'form', formName, success ? 1 : 0)
  }, [])

  const trackSignUp = useCallback((method: string = 'email') => {
    trackEvent('sign_up', 'user', method)
    trackConversion('AW-CONVERSION-ID', 'SIGNUP') // Replace with your conversion ID
  }, [])

  const trackSignIn = useCallback((method: string = 'email') => {
    trackEvent('login', 'user', method)
  }, [])

  const trackPurchase = useCallback((plan: string, amount: number) => {
    trackEvent('purchase', 'ecommerce', plan, amount)
    trackConversion('AW-CONVERSION-ID', 'PURCHASE') // Replace with your conversion ID
  }, [])

  const trackFeatureUsage = useCallback((feature: string, action: string) => {
    trackEvent('feature_usage', 'engagement', `${feature}_${action}`)
  }, [])

  const trackContentEngagement = useCallback((contentType: string, contentId: string) => {
    trackEvent('content_engagement', 'engagement', `${contentType}_${contentId}`)
  }, [])

  const trackNicheSelection = useCallback((niche: string) => {
    trackEvent('niche_selection', 'onboarding', niche)
  }, [])

  const trackOnboardingStep = useCallback((step: string, completed: boolean) => {
    trackEvent('onboarding_step', 'onboarding', step, completed ? 1 : 0)
  }, [])

  const trackError = useCallback((errorType: string, errorMessage: string) => {
    trackEvent('error', 'system', errorType, 1)
  }, [])

  const trackSearch = useCallback((searchTerm: string, resultsCount: number) => {
    trackEvent('search', 'engagement', searchTerm, resultsCount)
  }, [])

  const trackSocialShare = useCallback((platform: string, content: string) => {
    trackEvent('share', 'social', platform)
  }, [])

  const trackVideoPlay = useCallback((videoTitle: string, videoId: string) => {
    trackEvent('video_play', 'engagement', videoTitle)
  }, [])

  const trackDownload = useCallback((fileType: string, fileName: string) => {
    trackEvent('download', 'engagement', `${fileType}_${fileName}`)
  }, [])

  const trackScrollDepth = useCallback((depth: number) => {
    trackEngagement('scroll_depth', { depth_percentage: depth })
  }, [])

  const trackTimeOnPage = useCallback((timeInSeconds: number) => {
    trackEngagement('time_on_page', { time_seconds: timeInSeconds })
  }, [])

  return {
    trackPageView: trackPageViewEvent,
    trackButtonClick,
    trackFormSubmission,
    trackSignUp,
    trackSignIn,
    trackPurchase,
    trackFeatureUsage,
    trackContentEngagement,
    trackNicheSelection,
    trackOnboardingStep,
    trackError,
    trackSearch,
    trackSocialShare,
    trackVideoPlay,
    trackDownload,
    trackScrollDepth,
    trackTimeOnPage,
  }
} 