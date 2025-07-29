"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStripe } from '@/hooks/use-stripe';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { CreditCard, Loader2, AlertTriangle, Info, Calendar, XCircle } from 'lucide-react';

export const BillingManagement = () => {
  const { openCustomerPortal, loading } = useStripe();
  const { paymentStatus, isLoading, refreshPaymentStatus } = usePaymentStatus();
  const [showCancellationInfo, setShowCancellationInfo] = useState(false);

  // Calculate next billing date (placeholder - would come from Stripe)
  const getNextBillingDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return nextMonth.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get subscription status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trialing':
        return 'secondary';
      case 'past_due':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Get subscription status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trialing':
        return 'bg-blue-500';
      case 'past_due':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Billing & Subscription</h2>
        <p className="text-muted-foreground">
          Manage your billing information, payment methods, and subscription
        </p>
      </div>

      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Your active subscription details and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading subscription details...</span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div>
                  <h3 className="font-medium">Tango Core Plan</h3>
                  <p className="text-sm text-gray-500">Monthly billing</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant={getStatusBadgeVariant(paymentStatus?.subscriptionStatus || 'inactive')} 
                      className={getStatusColor(paymentStatus?.subscriptionStatus || 'inactive')}
                    >
                      {paymentStatus?.subscriptionStatus === 'active' ? 'Active' : 
                       paymentStatus?.subscriptionStatus === 'trialing' ? 'Trial' :
                       paymentStatus?.subscriptionStatus === 'past_due' ? 'Past Due' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Next billing: {getNextBillingDate()}
                    </span>
                  </div>
                  {paymentStatus?.niches && paymentStatus.niches.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Active niches: {paymentStatus.niches.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">$39.99</p>
                  <p className="text-sm text-gray-500">per month</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentStatus?.stripeCustomerId ? (
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">•••• •••• •••• ••••</p>
                    <p className="text-sm text-muted-foreground">Payment method on file</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500">Default</Badge>
              </div>
            ) : (
              <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg">
                <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No payment method on file</p>
              </div>
            )}
            <Button variant="outline" className="w-full">
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Your recent invoices and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentStatus?.stripeCustomerId ? (
              <div className="text-center p-4">
                <p className="text-sm text-gray-500 mb-2">Billing history available in Stripe portal</p>
                <Button 
                  onClick={openCustomerPortal}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'View Billing History'
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg">
                <p className="text-sm text-gray-500">No billing history available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Portal */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Portal</CardTitle>
          <CardDescription>
            Access your Stripe billing portal to manage invoices, payment methods, and subscription settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={openCustomerPortal}
              disabled={loading || !paymentStatus?.stripeCustomerId}
              className="w-full"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Open Billing Portal'
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              The billing portal allows you to update payment methods, view invoices, and manage your subscription
            </p>
            {!paymentStatus?.stripeCustomerId && (
              <p className="text-sm text-orange-600 text-center">
                ⚠️ No Stripe customer ID found. Please contact support if you have billing questions.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Section */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <XCircle className="w-5 h-5" />
            Cancel Subscription
          </CardTitle>
          <CardDescription className="text-orange-700">
            Cancel your subscription and manage your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Cancellation takes effect at the end of your current billing period. 
                You'll retain access to all features until then.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span>Your subscription will remain active until <strong>{getNextBillingDate()}</strong></span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-blue-600" />
                <span>You can reactivate your subscription at any time</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={openCustomerPortal}
                disabled={loading || !paymentStatus?.stripeCustomerId}
                variant="destructive"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </Button>
              
              <Button 
                onClick={() => setShowCancellationInfo(!showCancellationInfo)}
                variant="outline"
                className="flex-1"
              >
                Learn More
              </Button>
            </div>

            {showCancellationInfo && (
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <h4 className="font-medium mb-2">Cancellation Process:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Click "Cancel Subscription" to open the billing portal</li>
                  <li>In the portal, find the "Cancel subscription" option</li>
                  <li>Confirm your cancellation</li>
                  <li>Your access continues until the end of your billing period</li>
                  <li>You can reactivate anytime by resubscribing</li>
                </ol>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 