import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface SubscriptionItem {
  id: string
  priceId: string
  productId: string
  productName: string
  unitAmount: number | null
  currency: string
  interval: string | null
  intervalCount: number | null
  quantity: number | null
}

interface SubscriptionDetails {
  id: string
  status: string
  currentPeriodStart: number
  currentPeriodEnd: number
  cancelAtPeriodEnd: boolean
  items: SubscriptionItem[]
  totalAmount: number
  currency: string
  defaultPaymentMethod: any
}

interface BillingHistoryItem {
  id: string
  number: string | null
  amountPaid: number
  currency: string
  status: string
  created: number
  periodStart: number
  periodEnd: number
}

interface SubscriptionDetailsResponse {
  subscription: SubscriptionDetails
  nextBillingDate: string
  billingHistory: BillingHistoryItem[]
  customerId: string
}

export const useSubscriptionDetails = () => {
  const { user, isLoaded } = useUser()
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!isLoaded || !user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/user/subscription-details')
        
        if (!response.ok) {
          if (response.status === 404) {
            // No subscription found - this is not an error
            setSubscriptionDetails(null)
            return
          }
          throw new Error('Failed to fetch subscription details')
        }

        const data = await response.json()
        console.log('🔧 Subscription details loaded:', data)
        setSubscriptionDetails(data)
      } catch (err) {
        console.error('Error fetching subscription details:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch subscription details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscriptionDetails()
  }, [isLoaded, user])

  const refreshSubscriptionDetails = async () => {
    if (!user) return

    try {
      console.log('🔄 Refreshing subscription details...')
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user/subscription-details')
      
      if (!response.ok) {
        if (response.status === 404) {
          setSubscriptionDetails(null)
          return
        }
        throw new Error('Failed to refresh subscription details')
      }

      const data = await response.json()
      console.log('✅ Subscription details refreshed:', data)
      setSubscriptionDetails(data)
    } catch (err) {
      console.error('❌ Error refreshing subscription details:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh subscription details')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100) // Stripe amounts are in cents
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return {
    subscriptionDetails,
    isLoading,
    error,
    refreshSubscriptionDetails,
    formatCurrency,
    formatDate
  }
} 