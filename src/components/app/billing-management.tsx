"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStripe } from '@/hooks/use-stripe';
import { CreditCard, Loader2 } from 'lucide-react';

export const BillingManagement = () => {
  const { openCustomerPortal, loading } = useStripe();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Billing</h2>
        <p className="text-muted-foreground">
          Manage your billing information and payment methods
        </p>
      </div>

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
            {/* Real billing history will be loaded from database */}
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

      {/* Manage Billing Button */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Portal</CardTitle>
          <CardDescription>
            Access your billing portal to manage invoices and payment methods
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}; 