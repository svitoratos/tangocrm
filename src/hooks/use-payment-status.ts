import { useState, useEffect, useRef } from 'react'
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

// Cache for payment status to avoid unnecessary API calls
let paymentStatusCache: {
  data: PaymentStatus | null
  timestamp: number
  userId: string | null
} = {
  data: null,
  timestamp: 0,
  userId: null
}

// Single-flight guard to dedupe concurrent requests
let inflightRequest: Promise<PaymentStatus | null> | null = null

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const usePaymentStatus = () => {
  const { user, isLoaded } = useUser()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Start as false to avoid loading UI
  const [error, setError] = useState<string | null>(null)
  const lastCheckRef = useRef<number>(0)
  const isInitialLoadRef = useRef(true)

  // Helper to fetch payment status with single-flight and throttling
  const fetchPaymentStatus = async (force = false): Promise<PaymentStatus | null> => {
    if (!user) return null

    const now = Date.now()

    // Throttle: avoid hitting the endpoint more than once every 1500ms per hook instance unless forced
    if (!force && now - lastCheckRef.current < 1500) {
      return paymentStatusCache.data
    }

    // Use cached response if valid and same user and not forced
    if (
      !force &&
      paymentStatusCache.data &&
      paymentStatusCache.userId === user.id &&
      (now - paymentStatusCache.timestamp) < CACHE_DURATION
    ) {
      lastCheckRef.current = now
      return paymentStatusCache.data
    }

    // If a request is already in-flight, await it instead of starting a new one
    if (inflightRequest) {
      try {
        const result = await inflightRequest
        return result
      } catch {
        return null
      }
    }

    // Start a new request
    const cacheBuster = Date.now()
    inflightRequest = (async () => {
      try {
        const response = await fetch(`/api/user/payment-status?t=${cacheBuster}`, {
          cache: 'no-store'
        })
        if (!response.ok) {
          throw new Error('Failed to check payment status')
        }
        const data: PaymentStatus = await response.json()
        paymentStatusCache = {
          data,
          timestamp: Date.now(),
          userId: user.id
        }
        lastCheckRef.current = Date.now()
        return data
      } finally {
        inflightRequest = null
      }
    })()

    return inflightRequest
  }

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!isLoaded || !user) return

      // Force clear cache for hello@gotangocrm.com to ensure fresh data
      if (user.emailAddresses?.[0]?.emailAddress === 'hello@gotangocrm.com') {
        console.log('🔧 Force clearing cache for hello@gotangocrm.com');
        clearCache();
      }

      // Only show loading on initial load, not background refreshes
      if (isInitialLoadRef.current) {
        setIsLoading(true)
      }

      try {
        setError(null)
        const data = await fetchPaymentStatus(false)
        if (data) setPaymentStatus(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check payment status')
      } finally {
        setIsLoading(false)
        isInitialLoadRef.current = false
      }
    }

    checkPaymentStatus()
  }, [isLoaded, user])

  const refreshPaymentStatus = async (showLoading = false) => {
    if (!user) return

    try {
      if (showLoading) setIsLoading(true)
      setError(null)

      // Clear cache to force fresh data
      paymentStatusCache = { data: null, timestamp: 0, userId: null }

      const data = await fetchPaymentStatus(true)
      if (data) setPaymentStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh payment status')
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  const clearCache = () => {
    paymentStatusCache = {
      data: null,
      timestamp: 0,
      userId: null
    }
  }

  const silentRefresh = async () => {
    if (!user) return

    const now = Date.now()
    // Only refresh if cache is expired
    if (
      !paymentStatusCache.data ||
      paymentStatusCache.userId !== user.id ||
      (now - paymentStatusCache.timestamp) >= CACHE_DURATION
    ) {
      await refreshPaymentStatus(false) // false = no loading state
    }
  }

  // Force refresh after payment success
  const forceRefreshAfterPayment = async () => {
    if (!user) return

    // Clear cache immediately
    clearCache()

    // Wait a moment for webhook to process
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      // Use the force refresh endpoint
      const response = await fetch('/api/user/force-refresh-payment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache'
      })

      if (response.ok) {
        const data: PaymentStatus = await response.json()
        paymentStatusCache = { data, timestamp: Date.now(), userId: user.id }
        setPaymentStatus(data)
      } else {
        await refreshPaymentStatus(false)
      }
    } catch (error) {
      await refreshPaymentStatus(false)
    }
  }

  return {
    paymentStatus,
    isLoading,
    error,
    refreshPaymentStatus,
    clearCache,
    silentRefresh,
    forceRefreshAfterPayment,
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