"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { useSubscriptionDetails } from '@/hooks/use-subscription-details';
import { useStripe } from '@/hooks/use-stripe';
import { CancellationForm } from './cancellation-form';
import { YearlyCancellationForm } from './yearly-cancellation-form';
import { FeedbackForm } from './feedback-form';
import { RetentionOffer } from './retention-offer';
import { FinalConfirmation } from './final-confirmation';
import { CreditCard, Loader2, AlertTriangle, Info, Calendar, XCircle } from 'lucide-react';

export const BillingManagementSimple = () => {
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
  const [showCancellationForm, setShowCancellationForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showRetentionOffer, setShowRetentionOffer] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [testYearlyForm, setTestYearlyForm] = useState(false); // Test mode toggle

  const isLoading = paymentStatusLoading || subscriptionLoading || portalLoading;

  const handleFeedbackSubmitted = () => {
    setShowCancellationForm(false);
    setShowFeedbackForm(true);
  };

  const handleFeedbackCompleted = () => {
    setShowFeedbackForm(false);
    setShowRetentionOffer(true);
  };

  const handleFeedbackCancelled = () => {
    setShowFeedbackForm(false);
    setShowCancellationForm(false);
  };

  const handleContinueToCancel = () => {
    setShowRetentionOffer(false);
    setShowFinalConfirmation(true);
  };

  const handleKeepAccount = () => {
    setShowFinalConfirmation(false);
  };

  const handleDeleteAccount = async () => {
    try {
      await openCustomerPortal();
      setShowFinalConfirmation(false);
    } catch (error) {
      console.error('Error opening Stripe portal:', error);
    }
  };

  const handleFinalConfirmationClose = () => {
    setShowFinalConfirmation(false);
  };

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
        return 'bg-green-500';
      case 'trialing':
        return 'bg-blue-500';
      case 'past_due':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getNextBillingDate = () => {
    if (subscriptionDetails?.current_period_end) {
      return formatDate(subscriptionDetails.current_period_end);
    }
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return nextMonth.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getSubscriptionTypeText = () => {
    if (isYearlySubscription) {
      return {
        plan: 'Tango Yearly Plan',
        billing: 'Yearly billing',
        discount: '50% off your next 3 months',
        savings: 'Save big with yearly billing'
      };
    } else {
      return {
        plan: 'Tango Monthly Plan',
        billing: 'Monthly billing',
        discount: '50% off your next 3 months',
        savings: 'Upgrade to yearly for better savings'
      };
    }
  };

  const subscriptionText = getSubscriptionTypeText();

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

                {/* Niche breakdown (from payment status) */}
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

      {/* Cancellation Section */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <XCircle className="w-5 h-5" />
            Cancel Subscription
          </CardTitle>
          <CardDescription className="text-orange-700">
            {testYearlyForm 
              ? "TEST MODE: Will show yearly cancellation form"
              : isYearlySubscription 
                ? "Cancel your yearly subscription and manage your account"
                : "Cancel your monthly subscription and manage your account"
            }
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

            <div className="space-y-3">
              <Button 
                onClick={() => setShowCancellationForm(true)}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </Button>
              
              {/* Test Mode Toggle */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <span className="text-xs text-gray-600">Test Mode:</span>
                <Button
                  onClick={() => setTestYearlyForm(!testYearlyForm)}
                  size="sm"
                  variant={testYearlyForm ? "default" : "outline"}
                  className="text-xs"
                >
                  {testYearlyForm ? "Yearly Form" : "Monthly Form"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showCancellationForm && (
        // Temporary test mode - set to true to test yearly form
        testYearlyForm ? (
          <YearlyCancellationForm
            onFeedbackSubmitted={handleFeedbackSubmitted}
            onClose={() => setShowCancellationForm(false)}
            nextBillingDate={getNextBillingDate()}
          />
        ) : isYearlySubscription ? (
          <YearlyCancellationForm
            onFeedbackSubmitted={handleFeedbackSubmitted}
            onClose={() => setShowCancellationForm(false)}
            nextBillingDate={getNextBillingDate()}
          />
        ) : (
          <CancellationForm
            onFeedbackSubmitted={handleFeedbackSubmitted}
            onClose={() => setShowCancellationForm(false)}
            nextBillingDate={getNextBillingDate()}
          />
        )
      )}

      {showFeedbackForm && (
        <FeedbackForm
          onContinue={handleFeedbackCompleted}
          onCancel={handleFeedbackCancelled}
        />
      )}

      {showRetentionOffer && (
        <RetentionOffer
          onContinueToCancel={handleContinueToCancel}
          onPauseAccount={handleKeepAccount}
          onClose={() => setShowRetentionOffer(false)}
        />
      )}

      {showFinalConfirmation && (
        <FinalConfirmation
          onKeepAccount={handleKeepAccount}
          onDeleteAccount={handleDeleteAccount}
          onClose={handleFinalConfirmationClose}
        />
      )}
    </div>
  );
}; 