'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, User, CreditCard } from 'lucide-react';

export default function FixUserSubscriptionPage() {
  const [targetUserId, setTargetUserId] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('si_So11BFvOmeqM0e'); // Pre-filled with the known subscription ID
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fixUserSubscription = async () => {
    if (!targetUserId || !subscriptionId) {
      setError('Please fill in both User ID and Subscription ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/fix-user-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId,
          subscriptionId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix user subscription');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const debugUserSubscription = async () => {
    if (!targetUserId) {
      setError('Please enter a User ID to debug');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/debug/user-subscription?userId=${targetUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to debug user subscription');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Fix User Subscription
          </CardTitle>
          <CardDescription>
            Fix a specific user's subscription ID in the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetUserId">User ID</Label>
            <Input
              id="targetUserId"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="Enter the user ID to fix"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscriptionId">Subscription ID</Label>
            <Input
              id="subscriptionId"
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
              placeholder="Enter the Stripe subscription ID"
            />
            <p className="text-sm text-gray-500">
              Pre-filled with the known subscription ID: si_So11BFvOmeqM0e
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={debugUserSubscription} 
              disabled={isLoading || !targetUserId}
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Debugging...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Debug User
                </>
              )}
            </Button>

            <Button 
              onClick={fixUserSubscription} 
              disabled={isLoading || !targetUserId || !subscriptionId}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fixing Subscription...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Fix Subscription
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Success!</strong> {result.message}</p>
                  
                  {result.user && (
                    <div className="mt-4 p-3 bg-gray-100 rounded">
                      <p><strong>Updated User:</strong></p>
                      <p>ID: {result.user.id}</p>
                      <p>Email: {result.user.email}</p>
                      <p>Subscription ID: {result.user.stripe_subscription_id}</p>
                      <p>Status: {result.user.subscription_status}</p>
                    </div>
                  )}
                  
                  {result.subscription && (
                    <div className="mt-4 p-3 bg-blue-100 rounded">
                      <p><strong>Stripe Subscription:</strong></p>
                      <p>ID: {result.subscription.id}</p>
                      <p>Status: {result.subscription.status}</p>
                      <p>Customer: {result.subscription.customer}</p>
                    </div>
                  )}

                  {result.debug && (
                    <div className="mt-4 p-3 bg-yellow-100 rounded">
                      <p><strong>Debug Info:</strong></p>
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(result.debug, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 