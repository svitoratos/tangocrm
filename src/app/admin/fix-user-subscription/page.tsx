"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function FixUserSubscriptionPage() {
  const [userId, setUserId] = useState('cus_SoYS8Apu07B9pB');
  const [subscriptionId, setSubscriptionId] = useState('si_SoYSRnMIkqZSd2');
  const [debugData, setDebugData] = useState<any>(null);
  const [fixResult, setFixResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDebug = async () => {
    setIsLoading(true);
    setError(null);
    setDebugData(null);

    try {
      const response = await fetch('/api/debug/user-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: userId,
          targetSubscriptionId: subscriptionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDebugData(data);
      } else {
        setError(data.error || 'Failed to debug user subscription');
      }
    } catch (err) {
      setError('Failed to debug user subscription');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFix = async () => {
    setIsLoading(true);
    setError(null);
    setFixResult(null);

    try {
      const response = await fetch('/api/admin/fix-user-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: userId,
          targetSubscriptionId: subscriptionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFixResult(data);
      } else {
        setError(data.error || 'Failed to fix user subscription');
      }
    } catch (err) {
      setError('Failed to fix user subscription');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Fix User Subscription</h1>
        <p className="text-gray-600">
          Debug and fix subscription issues for specific users
        </p>
      </div>

      <div className="grid gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Enter the user ID and subscription ID to debug and fix
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID (Stripe Customer ID)</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="cus_..."
              />
            </div>
            <div>
              <Label htmlFor="subscriptionId">Subscription ID</Label>
              <Input
                id="subscriptionId"
                value={subscriptionId}
                onChange={(e) => setSubscriptionId(e.target.value)}
                placeholder="si_..."
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={handleDebug} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Debug User
              </Button>
              <Button onClick={handleFix} disabled={isLoading} variant="outline">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Fix Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Debug Results */}
        {debugData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Debug Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">User Data (Database)</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(debugData.user, null, 2)}
                  </pre>
                </div>
                
                {debugData.stripeCustomer && (
                  <div>
                    <h4 className="font-semibold mb-2">Stripe Customer</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(debugData.stripeCustomer, null, 2)}
                    </pre>
                  </div>
                )}
                
                {debugData.stripeSubscriptions && debugData.stripeSubscriptions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Stripe Subscriptions</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(debugData.stripeSubscriptions, null, 2)}
                    </pre>
                  </div>
                )}
                
                {debugData.fixNeeded && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Fix Needed:</strong> {debugData.fixAction}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fix Results */}
        {fixResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {fixResult.fixApplied ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
                Fix Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant={fixResult.fixApplied ? "default" : "destructive"}>
                  <AlertDescription>
                    <strong>Fix Applied:</strong> {fixResult.fixApplied ? 'Yes' : 'No'}
                  </AlertDescription>
                </Alert>
                
                <div>
                  <h4 className="font-semibold mb-2">Fix Details</h4>
                  <p className="text-gray-700">{fixResult.fixDetails}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Updated User Data</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(fixResult.user, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 