"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePaymentStatus } from '@/hooks/use-payment-status';
import { useSubscriptionDetails } from '@/hooks/use-subscription-details';
import { useUser } from '@clerk/nextjs';
// Stripe components removed - will be replaced with new provider
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  Layers,
  Settings,
  ExternalLink,
  Loader2,
  ChevronRight,
  Star,
  Zap,
  Users,
  BarChart3,
  FileText,
  Shield,
  Crown,
  Package
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
    isMonthlySubscription,
    refetch: refetchSubscription
  } = useSubscriptionDetails();

  // Using direct Stripe portal link - no loading states needed
  const [activeTab, setActiveTab] = useState('overview');
  
  const isLoading = paymentStatusLoading || subscriptionLoading;


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


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Subscription Management</h2>
        <p className="text-muted-foreground">
          Manage your subscription, billing, and account features
        </p>
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
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Plan</span>
                  <span className="text-sm font-medium">Tango Core</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Status</span>
                  <Badge variant={subscriptionDetails?.status === 'active' ? 'default' : 'secondary'}>
                    {subscriptionDetails?.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Billing Cycle</span>
                  <span className="text-sm font-medium capitalize">
                    {isYearlySubscription ? 'Yearly' : 'Monthly'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Total Amount</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(subscriptionDetails?.amount || 0, subscriptionDetails?.currency || 'USD')}
                    /{isYearlySubscription ? 'year' : 'month'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Next Billing</span>
                  <span className="text-sm font-medium">
                    {subscriptionDetails?.current_period_end 
                      ? formatDate(subscriptionDetails.current_period_end)
                      : 'Unknown'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Niches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                Active Niches ({subscriptionDetails?.niches?.length || 0})
              </CardTitle>
              <CardDescription>
                All the creator niches you currently have access to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionDetails?.niches && subscriptionDetails.niches.length > 0 ? (
                <div className="space-y-3">
                  {subscriptionDetails.niches.map((nicheItem: any) => (
                    <div key={nicheItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <div>
                          <p className="font-medium capitalize">{nicheItem.niche}</p>
                          <p className="text-sm text-slate-600">{nicheItem.product_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(nicheItem.amount || 0, nicheItem.currency || 'USD')}
                        </p>
                        <p className="text-xs text-slate-600 capitalize">
                          per {nicheItem.interval}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Multiple Subscription Notice */}
                  {subscriptionDetails.niches.length > 1 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900 mb-1">Multiple Subscriptions</p>
                          <p className="text-blue-700">
                            You have {subscriptionDetails.niches.length} active subscriptions. 
                            When you access the billing portal, you'll be able to manage each subscription individually.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <Layers className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p>No active niches found</p>
                </div>
              )}
            </CardContent>
          </Card>

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
                <span className="text-sm">Analytics dashboard</span>
              </div>
            </div>
          </div>
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

                
                <Button
                  className="w-full"
                  onClick={() => {
                    // Direct link to Stripe Customer Portal
                    window.location.href = 'https://billing.stripe.com/p/login/fZueVebJofyHaBi35W2Nq00';
                  }}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Billing
                </Button>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

      </Tabs>

    </div>
  );
}; 