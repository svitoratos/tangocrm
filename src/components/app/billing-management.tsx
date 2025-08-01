"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { useSubscriptionDetails } from '@/hooks/use-subscription-details';
import { useStripe } from '@/hooks/use-stripe';
import { useUser } from '@clerk/nextjs';
import { CancellationFormModal } from './cancellation-form-modal';
import { CreditCard, Loader2, AlertTriangle, Info, Calendar, Mail } from 'lucide-react';

export const BillingManagement = () => {
  const { user } = useUser();
  const { paymentStatus, isLoading: paymentStatusLoading } = usePaymentStatus();
  const {
    subscriptionDetails,
    isLoading: subscriptionLoading,
    formatCurrency,
    formatDate,
    isYearlySubscription,
    isMonthlySubscription
  } = useSubscriptionDetails();

  const { openCustomerPortal, loading: portalLoading } = useStripe();
  const [showContactModal, setShowContactModal] = useState(false);
  const isLoading = paymentStatusLoading || subscriptionLoading || portalLoading;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'trialing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'past_due':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextBillingDate = () => {
    if (subscriptionDetails?.current_period_end) {
      return formatDate(subscriptionDetails.current_period_end);
    }
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return nextMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getSubscriptionTypeText = () => {
    if (isYearlySubscription) {
      return {
        plan: 'Tango Yearly Plan',
        billing: 'Yearly billing',
        savings: 'Save big with yearly billing'
      };
    } else {
      return {
        plan: 'Tango Monthly Plan',
        billing: 'Monthly billing',
        savings: 'Upgrade to yearly for better savings'
      };
    }
  };

  const subscriptionText = getSubscriptionTypeText();

  const handleEmailCancellation = () => {
    setShowContactModal(true);
  };

  const getCancellationMessage = () => {
    return `Hi Tango Team,

I would like to request cancellation of my Tango CRM subscription.

Account Details:
- Email: ${user?.emailAddresses?.[0]?.emailAddress || 'Not provided'}
- Subscription Type: ${subscriptionText.plan}
- Current Status: ${subscriptionDetails?.status || 'Active'}

Please process my cancellation request.

Thank you.`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Billing & Subscription</h2>
        <p className="text-muted-foreground">
          Manage your billing information, payment methods, and subscription
        </p>
      </div>

      {/* Current Subscription */}
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
            ) : subscriptionDetails ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div>
                    <h3 className="font-medium">{subscriptionText.plan}</h3>
                    <p className="text-sm text-gray-500">{subscriptionText.billing}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={getStatusBadgeVariant(subscriptionDetails.status)}
                        className={getStatusColor(subscriptionDetails.status)}
                      >
                        {subscriptionDetails.status === 'active' ? 'Active' :
                         subscriptionDetails.status === 'past_due' ? 'Past Due' :
                         subscriptionDetails.status === 'trialing' ? 'Trial' : 'Inactive'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Next billing: {getNextBillingDate()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {formatCurrency(subscriptionDetails.amount, subscriptionDetails.currency)}
                    </p>
                    <p className="text-sm text-gray-500">
                      per {isYearlySubscription ? 'year' : 'month'}
                    </p>
                  </div>
                </div>

                {/* Niche breakdown */}
                {paymentStatus?.niches && paymentStatus.niches.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Active Niches:</h4>
                    <div className="space-y-2">
                      {paymentStatus.niches.map((niche) => (
                        <div key={niche} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="font-medium">{niche}</span>
                            <Badge variant="secondary" className="text-xs">Active</Badge>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-green-600 font-medium">Active</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-sm text-gray-500">No active subscription found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Portal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Billing Management
          </CardTitle>
          <CardDescription>
            Update payment methods, view invoices, and manage your billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Access your Stripe customer portal to manage payment methods, view billing history, and download invoices.
              </AlertDescription>
            </Alert>

            <Button
              onClick={openCustomerPortal}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Billing
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Request */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Mail className="w-5 h-5" />
            Request Cancellation
          </CardTitle>
          <CardDescription className="text-orange-700">
            Need to cancel your subscription? Send us a message and we'll help you.
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

            <Button
              onClick={handleEmailCancellation}
              disabled={isLoading}
              variant="outline"
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Request Cancellation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Form Modal */}
      <CancellationFormModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        prefillSubject="Cancellation Request"
        prefillEmail={user?.emailAddresses?.[0]?.emailAddress || ""}
        title="Request Cancellation"
        description="Please provide your details and we'll process your cancellation request."
      />
    </div>
  );
}; 