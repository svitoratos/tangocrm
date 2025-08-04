'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function FixSubscriptionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fixSubscriptionIds = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/fix-subscription-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix subscription IDs');
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
          <CardTitle>Fix Subscription IDs</CardTitle>
          <CardDescription>
            This tool will fix missing subscription IDs for users who have Stripe customer IDs but are missing subscription IDs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={fixSubscriptionIds} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixing Subscription IDs...
              </>
            ) : (
              'Fix Subscription IDs'
            )}
          </Button>

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
                  <p><strong>Processed:</strong> {result.results.processed} users</p>
                  <p><strong>Updated:</strong> {result.results.updated} users</p>
                  <p><strong>Errors:</strong> {result.results.errors} users</p>
                  
                  {result.results.details.length > 0 && (
                    <div className="mt-4">
                      <p className="font-semibold">Details:</p>
                      <div className="max-h-60 overflow-y-auto space-y-1 text-sm">
                        {result.results.details.map((detail: any, index: number) => (
                          <div key={index} className="p-2 bg-gray-100 rounded">
                            <p><strong>User ID:</strong> {detail.userId}</p>
                            <p><strong>Status:</strong> {detail.status}</p>
                            {detail.subscriptionId && (
                              <p><strong>Subscription ID:</strong> {detail.subscriptionId}</p>
                            )}
                            {detail.subscriptionStatus && (
                              <p><strong>Status:</strong> {detail.subscriptionStatus}</p>
                            )}
                            {detail.reason && (
                              <p><strong>Reason:</strong> {detail.reason}</p>
                            )}
                            {detail.error && (
                              <p><strong>Error:</strong> {detail.error}</p>
                            )}
                          </div>
                        ))}
                      </div>
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