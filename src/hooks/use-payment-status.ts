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

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const usePaymentStatus = () => {
  const { user, isLoaded } = useUser()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Start as false to avoid loading UI
  const [error, setError] = useState<string | null>(null)
  const lastCheckRef = useRef<number>(0)
  const isInitialLoadRef = useRef(true)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!isLoaded || !user) {
        return
      }

      const now = Date.now()
      const userId = user.id
      
      // Force clear cache for hello@gotangocrm.com to ensure fresh data
      if (user.emailAddresses?.[0]?.emailAddress === 'hello@gotangocrm.com') {
        console.log('🔧 Force clearing cache for hello@gotangocrm.com');
        clearCache();
      }
      
      // Check if we have valid cached data for this user
      if (
        paymentStatusCache.data &&
        paymentStatusCache.userId === userId &&
        (now - paymentStatusCache.timestamp) < CACHE_DURATION &&
        (now - lastCheckRef.current) > 1000 // Prevent multiple calls within 1 second
      ) {
        setPaymentStatus(paymentStatusCache.data)
        return
      }

      // Only show loading on initial load, not background refreshes
      if (isInitialLoadRef.current) {
        setIsLoading(true)
      }
      
      try {
        setError(null)
        lastCheckRef.current = now

        // Add cache-busting parameter to ensure fresh data
        const cacheBuster = Date.now();
        const response = await fetch(`/api/user/payment-status?t=${cacheBuster}`)
        
        if (!response.ok) {
          throw new Error('Failed to check payment status')
        }

        const data = await response.json()
        
        // Update cache
        paymentStatusCache = {
          data,
          timestamp: now,
          userId
        }
        
        setPaymentStatus(data)
      } catch (err) {
        // Silently handle errors without showing to user
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
      if (showLoading) {
        setIsLoading(true)
      }
      setError(null)

      // Clear cache to force fresh data
      paymentStatusCache = {
        data: null,
        timestamp: 0,
        userId: null
      }

      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = Date.now();
      const response = await fetch(`/api/user/payment-status?t=${cacheBuster}`)
      
      if (!response.ok) {
        throw new Error('Failed to refresh payment status')
      }

      const data = await response.json()
      
      // Update cache with fresh data
      paymentStatusCache = {
        data,
        timestamp: Date.now(),
        userId: user.id
      }
      
      setPaymentStatus(data)
    } catch (err) {
      // Silently handle errors without showing to user
      setError(err instanceof Error ? err.message : 'Failed to refresh payment status')
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
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
    const userId = user.id
    
    // Only refresh if cache is expired
    if (
      !paymentStatusCache.data ||
      paymentStatusCache.userId !== userId ||
      (now - paymentStatusCache.timestamp) >= CACHE_DURATION
    ) {
      await refreshPaymentStatus(false) // false = no loading state
    }
  }

  // Force refresh after payment success
  const forceRefreshAfterPayment = async () => {
    if (!user) return
    
    console.log('🔧 Force refreshing payment status after payment success...')
    
    // Clear cache immediately
    clearCache()
    
    // Wait a moment for webhook to process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      // Use the force refresh endpoint
      const response = await fetch('/api/user/force-refresh-payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update cache with fresh data
        paymentStatusCache = {
          data,
          timestamp: Date.now(),
          userId: user.id
        }
        
        setPaymentStatus(data);
        console.log('✅ Force refresh completed successfully');
      } else {
        console.error('❌ Force refresh failed, falling back to regular refresh');
        await refreshPaymentStatus(false);
      }
    } catch (error) {
      console.error('❌ Force refresh error, falling back to regular refresh:', error);
      await refreshPaymentStatus(false);
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