import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface PaymentStatus {
  hasCompletedOnboarding: boolean
  hasActiveSubscription: boolean
  subscriptionStatus: string
  subscriptionTier: string
  primaryNiche: string | null
  niches: string[]
  stripeCustomerId: string | null
}

export const usePaymentStatus = () => {
  const { user, isLoaded } = useUser()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!isLoaded || !user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/user/payment-status')
        
        if (!response.ok) {
          throw new Error('Failed to check payment status')
        }

        const data = await response.json()
        setPaymentStatus(data)
      } catch (err) {
        console.error('Error checking payment status:', err)
        setError(err instanceof Error ? err.message : 'Failed to check payment status')
      } finally {
        setIsLoading(false)
      }
    }

    checkPaymentStatus()
  }, [isLoaded, user])

  const refreshPaymentStatus = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user/payment-status')
      
      if (!response.ok) {
        throw new Error('Failed to refresh payment status')
      }

      const data = await response.json()
      setPaymentStatus(data)
    } catch (err) {
      console.error('Error refreshing payment status:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh payment status')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    paymentStatus,
    isLoading,
    error,
    refreshPaymentStatus,
    // Convenience getters
    hasCompletedOnboarding: paymentStatus?.hasCompletedOnboarding ?? false,
    hasActiveSubscription: paymentStatus?.hasActiveSubscription ?? false,
    subscriptionStatus: paymentStatus?.subscriptionStatus ?? 'inactive',
    subscriptionTier: paymentStatus?.subscriptionTier ?? 'free',
    primaryNiche: paymentStatus?.primaryNiche ?? null,
    niches: paymentStatus?.niches ?? [],
    stripeCustomerId: paymentStatus?.stripeCustomerId ?? null
  }
} 