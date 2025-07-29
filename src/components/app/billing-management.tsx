"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStripe } from '@/hooks/use-stripe';
import { CreditCard, Loader2, AlertTriangle, Info, Calendar, XCircle } from 'lucide-react';

export const BillingManagement = () => {
  const { openCustomerPortal, loading } = useStripe();
  const [showCancellationInfo, setShowCancellationInfo] = useState(false);

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
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div>
                <h3 className="font-medium">Tango Core Plan</h3>
                <p className="text-sm text-gray-500">Monthly billing</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default" className="bg-green-500">Active</Badge>
                  <span className="text-sm text-gray-500">Next billing: July 11, 2024</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">$29</p>
                <p className="text-sm text-gray-500">per month</p>
              </div>
            </div>
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
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Badge className="bg-emerald-500">Default</Badge>
            </div>
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
            {[
              { date: '2024-07-11', amount: 29, status: 'paid', invoice: 'INV-001' },
              { date: '2024-06-11', amount: 29, status: 'paid', invoice: 'INV-002' },
              { date: '2024-05-11', amount: 29, status: 'paid', invoice: 'INV-003' },
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{invoice.invoice}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">${invoice.amount}</span>
                  <Badge className="bg-emerald-500">
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
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
              disabled={loading}
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
                <span>Your subscription will remain active until <strong>July 11, 2024</strong></span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-blue-600" />
                <span>You can reactivate your subscription at any time</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={openCustomerPortal}
                disabled={loading}
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