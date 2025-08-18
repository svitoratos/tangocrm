export interface PaymentLinkConfig {
  niche: string;
  billingCycle: 'monthly' | 'yearly';
  isNicheUpgrade?: boolean;
  userId?: string;
}

export interface MultiNichePaymentConfig {
  niches: string[];
  billingCycle: 'monthly' | 'yearly';
  isNicheUpgrade?: boolean;
  userId?: string;
}

export interface PaymentLinkResult {
  success: boolean;
  url?: string;
  error?: string;
  sessionId?: string;
}

/**
 * Centralized payment service that ensures all payments go through our customer consolidation logic
 * instead of hardcoded Stripe payment links that bypass our safeguards.
 * 
 * This service is purely client-side and only makes API calls to our server endpoints.
 */
export class PaymentService {
  /**
   * Creates a checkout session for a new subscription or niche upgrade
   * This ensures customer consolidation by using our API endpoints
   */
  static async createCheckoutSession(config: PaymentLinkConfig): Promise<PaymentLinkResult> {
    try {
      console.log('🔧 PaymentService: Creating checkout session for:', config);

      if (!config.userId) {
        return {
          success: false,
          error: 'User ID is required for checkout session creation'
        };
      }

      // Use our API endpoint that ensures customer consolidation
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          niche: config.niche,
          billingCycle: config.billingCycle,
          isNicheUpgrade: config.isNicheUpgrade || false
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.url) {
        console.log('✅ PaymentService: Checkout session created successfully');
        return {
          success: true,
          url: data.url,
          sessionId: data.sessionId
        };
      } else {
        console.error('❌ PaymentService: Failed to create checkout session:', data.error);
        return {
          success: false,
          error: data.error || 'Failed to create checkout session'
        };
      }
    } catch (error) {
      console.error('❌ PaymentService: Error creating checkout session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Creates a checkout session for niche upgrades specifically
   * This ensures existing customers don't get new customer IDs
   */
  static async createNicheUpgradeSession(config: PaymentLinkConfig): Promise<PaymentLinkResult> {
    try {
      console.log('🔧 PaymentService: Creating niche upgrade session for:', config);

      if (!config.userId) {
        return {
          success: false,
          error: 'User ID is required for niche upgrade'
        };
      }

      // For niche upgrades, we need to ensure we're using the existing customer
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          niche: config.niche,
          billingCycle: config.billingCycle,
          isNicheUpgrade: true // This is important for webhook handling
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.url) {
        console.log('✅ PaymentService: Niche upgrade session created successfully');
        return {
          success: true,
          url: data.url,
          sessionId: data.sessionId
        };
      } else {
        console.error('❌ PaymentService: Failed to create niche upgrade session:', data.error);
        return {
          success: false,
          error: data.error || 'Failed to create niche upgrade session'
        };
      }
    } catch (error) {
      console.error('❌ PaymentService: Error creating niche upgrade session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Creates a multi-niche checkout session for onboarding or niche upgrades
   * Since Tango Core includes all niches, we now use single-niche checkout with the primary niche
   */
  static async createMultiNicheCheckoutSession(config: MultiNichePaymentConfig): Promise<PaymentResult> {
    try {
      console.log('🔧 PaymentService: Creating multi-niche checkout session for:', config);

      if (!config.niches || config.niches.length === 0) {
        return {
          success: false,
          error: 'At least one niche is required'
        };
      }

      if (config.niches.length > 4) {
        return {
          success: false,
          error: 'Maximum 4 niches allowed'
        };
      }

      // Since Tango Core includes all niches, we use the primary niche for checkout
      // All niches will be unlocked automatically after payment
      const primaryNiche = config.niches[0];
      
      console.log('🔧 PaymentService: Using single-niche checkout for Tango Core with primary niche:', primaryNiche);

      // Use the single-niche checkout endpoint instead
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          niche: primaryNiche,
          billingCycle: config.billingCycle,
          isNicheUpgrade: config.isNicheUpgrade || false,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/onboarding`
        })
      });

      const data = await response.json();

      if (response.ok && data.url) {
        console.log('✅ PaymentService: Single-niche checkout session created successfully for Tango Core');
        return {
          success: true,
          url: data.url,
          sessionId: data.sessionId
        };
      } else {
        console.error('❌ PaymentService: Failed to create single-niche checkout session:', data.error);
        return {
          success: false,
          error: data.error || 'Failed to create checkout session'
        };
      }
    } catch (error) {
      console.error('❌ PaymentService: Error creating single-niche checkout session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Fallback method that creates a Stripe payment link as a last resort
   * This should only be used when our API is completely down
   * WARNING: This bypasses customer consolidation and should be avoided
   */
  static async createFallbackPaymentLink(config: PaymentLinkConfig): Promise<PaymentLinkResult> {
    try {
      console.warn('⚠️ PaymentService: Using fallback payment link (bypasses customer consolidation):', config);

      // This is the emergency fallback - creates a payment link that bypasses our safeguards
      // We should avoid this at all costs, but it's here as a last resort
      // Since this is client-side, we'll redirect to a server endpoint that can create the fallback
      
      const response = await fetch('/api/stripe/create-fallback-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          niche: config.niche,
          billingCycle: config.billingCycle,
          isNicheUpgrade: config.isNicheUpgrade || false,
          userId: config.userId || 'unknown'
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.url) {
        console.warn('⚠️ PaymentService: Fallback payment link created (customer consolidation bypassed)');
        
        return {
          success: true,
          url: data.url,
          error: 'WARNING: This payment bypasses customer consolidation safeguards'
        };
      } else {
        throw new Error(data.error || 'Failed to create fallback payment link');
      }
    } catch (error) {
      console.error('❌ PaymentService: Error creating fallback payment link:', error);
      return {
        success: false,
        error: 'Failed to create fallback payment link'
      };
    }
  }

  /**
   * Attempts to create a checkout session with multiple fallback strategies
   * This ensures maximum reliability while maintaining customer consolidation
   */
  static async createCheckoutSessionWithFallbacks(config: PaymentLinkConfig): Promise<PaymentLinkResult> {
    console.log('🔧 PaymentService: Attempting checkout session creation with fallbacks for:', config);

    // First attempt: Use our API endpoint (ensures customer consolidation)
    const primaryResult = await this.createCheckoutSession(config);
    if (primaryResult.success) {
      return primaryResult;
    }

    console.warn('⚠️ PaymentService: Primary checkout session creation failed, trying niche upgrade endpoint...');

    // Second attempt: Try niche upgrade endpoint if this is an upgrade
    if (config.isNicheUpgrade) {
      const upgradeResult = await this.createNicheUpgradeSession(config);
      if (upgradeResult.success) {
        return upgradeResult;
      }
    }

    console.error('❌ PaymentService: All checkout session creation methods failed');
    console.error('❌ PaymentService: Last error:', primaryResult.error);

    // Final fallback: Create a payment link (bypasses customer consolidation)
    // This should only happen if our entire API is down
    console.warn('⚠️ PaymentService: Using emergency fallback payment link (customer consolidation bypassed)');
    return await this.createFallbackPaymentLink(config);
  }
}

export default PaymentService;
