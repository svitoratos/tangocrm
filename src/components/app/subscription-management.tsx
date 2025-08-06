"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { useSubscriptionDetails } from '@/hooks/use-subscription-details';
import { useStripe } from '@/hooks/use-stripe';
import { useUser } from '@clerk/nextjs';

import { 
  CreditCard, 
  Loader2, 
  AlertTriangle, 
  Info, 
  Calendar, 
  Mail, 
  CheckCircle, 
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Star
} from 'lucide-react';

export const SubscriptionManagement = () => {
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

  const { openCustomerPortal, loading: portalLoading, error: portalError } = useStripe();
  const [activeTab, setActiveTab] = useState('overview');
  
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
        savings: 'Save 20% with yearly billing',
        icon: <Crown className="w-4 h-4" />
      };
    } else {
      return {
        plan: 'Tango Monthly Plan',
        billing: 'Monthly billing',
        savings: 'Upgrade to yearly for 20% savings',
        icon: <Star className="w-4 h-4" />
      };
    }
  };

  const subscriptionText = getSubscriptionTypeText();





  const handleUpgradeToYearly = async () => {
    try {
      // This would typically redirect to a checkout session for yearly upgrade
      await openCustomerPortal();
    } catch (error) {
      console.error('Error upgrading to yearly:', error);
    }
  };

  const handleDowngradeToMonthly = async () => {
    try {
      // This would typically redirect to a checkout session for monthly downgrade
      await openCustomerPortal();
    } catch (error) {
      console.error('Error downgrading to monthly:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Subscription Management</h2>
          <p className="text-muted-foreground">
            Manage your subscription, billing, and account features
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Current Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Current Subscription
              </CardTitle>
              <CardDescription>
                Your active subscription details and status
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
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center gap-3">
                        {subscriptionText.icon}
                        <div>
                          <h3 className="font-semibold text-lg">{subscriptionText.plan}</h3>
                          <p className="text-sm text-gray-600">{subscriptionText.billing}</p>
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
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">
                          {formatCurrency(subscriptionDetails.amount, subscriptionDetails.currency)}
                        </p>
                        <p className="text-sm text-gray-500">
                          per {isYearlySubscription ? 'year' : 'month'}
                        </p>
                        {isYearlySubscription && (
                          <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                            Save 20%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Niche breakdown */}
                    {paymentStatus?.niches && paymentStatus.niches.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-700">Active Niches:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {paymentStatus.niches.map((niche) => (
                            <div key={niche} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="font-medium capitalize">{niche}</span>
                                <Badge variant="secondary" className="text-xs">Active</Badge>
                              </div>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subscription Features */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700">Plan Features:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 border rounded-lg bg-white">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Unlimited clients</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 border rounded-lg bg-white">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Content calendar</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 border rounded-lg bg-white">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Revenue tracking</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 border rounded-lg bg-white">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Goal setting</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</p>
                    <p className="text-sm text-gray-500 mb-4">You don't have an active subscription yet.</p>
                    <Button onClick={() => window.location.href = '/pricing'}>
                      View Plans
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
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

                {portalError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      {portalError}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button
                  onClick={async () => {
                    try {
                      await openCustomerPortal();
                    } catch (error) {
                      console.error('Portal error:', error);
                    }
                  }}
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

          {/* Billing Cycle Options */}
          {subscriptionDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Billing Cycle
                </CardTitle>
                <CardDescription>
                  Change your billing cycle to optimize costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isMonthlySubscription ? (
                    <div className="space-y-3">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Upgrade to yearly billing</strong> and save 20% on your subscription.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={handleUpgradeToYearly}
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Upgrade to Yearly (Save 20%)
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          You're currently on yearly billing. You can switch to monthly billing if needed.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={handleDowngradeToMonthly}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full"
                      >
                        <ArrowDownRight className="mr-2 h-4 w-4" />
                        Switch to Monthly
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>


      </Tabs>


    </div>
  );
}; 