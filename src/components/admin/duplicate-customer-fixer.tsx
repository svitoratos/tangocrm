import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';

interface DuplicateCustomer {
  user_id: string;
  email: string;
  stored_customer_id: string;
  stripe_customer_ids: string[];
  primary_customer_id: string;
  needs_fix: boolean;
}

export const DuplicateCustomerFixer = () => {
  const [duplicates, setDuplicates] = useState<DuplicateCustomer[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scanForDuplicates = async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/fix-duplicate-customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan' })
      });

      if (!response.ok) {
        throw new Error('Failed to scan for duplicates');
      }

      const data = await response.json();
      setDuplicates(data.duplicates || []);
      
      if (data.duplicates.length === 0) {
        setError('No duplicate customers found! 🎉');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsScanning(false);
    }
  };

  const fixAllDuplicates = async () => {
    setIsFixing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/fix-duplicate-customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fix-all' })
      });

      if (!response.ok) {
        throw new Error('Failed to fix duplicates');
      }

      const data = await response.json();
      setResults(data.results || []);
      
      // Refresh the duplicates list
      await scanForDuplicates();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsFixing(false);
    }
  };

  const fixSpecificUser = async (email: string) => {
    try {
      const response = await fetch('/api/admin/fix-duplicate-customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fix', userEmail: email })
      });

      if (!response.ok) {
        throw new Error('Failed to fix duplicates for user');
      }

      // Refresh the duplicates list
      await scanForDuplicates();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Duplicate Customer Fixer
          </CardTitle>
          <CardDescription>
            Scan for and fix duplicate Stripe customer IDs to ensure one customer per user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={scanForDuplicates} 
              disabled={isScanning}
              className="flex items-center gap-2"
            >
              {isScanning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isScanning ? 'Scanning...' : 'Scan for Duplicates'}
            </Button>
            
            {duplicates.length > 0 && (
              <Button 
                onClick={fixAllDuplicates} 
                disabled={isFixing}
                variant="destructive"
                className="flex items-center gap-2"
              >
                {isFixing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wrench className="w-4 h-4" />
                )}
                {isFixing ? 'Fixing...' : `Fix All (${duplicates.length})`}
              </Button>
            )}
          </div>

          {error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Fix Results:</h4>
              {results.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="font-medium">{result.email}:</span>
                  {result.success ? (
                    <span className="text-green-600">
                      {result.result.message} ({result.result.merged_customers} customers merged)
                    </span>
                  ) : (
                    <span className="text-red-600">{result.error}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {duplicates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Duplicate Customers Found</CardTitle>
            <CardDescription>
              {duplicates.length} users have duplicate Stripe customer IDs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {duplicates.map((duplicate, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{duplicate.email}</h4>
                      <p className="text-sm text-slate-600">
                        User ID: {duplicate.user_id}
                      </p>
                    </div>
                    <Badge variant={duplicate.needs_fix ? "destructive" : "secondary"}>
                      {duplicate.needs_fix ? "Needs Fix" : "OK"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Stored Customer ID:</span> {duplicate.stored_customer_id}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Stripe Customer IDs:</span>
                      <div className="mt-1 space-y-1">
                        {duplicate.stripe_customer_ids.map((id, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className={`font-mono text-xs ${idx === 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {id}
                            </span>
                            {idx === 0 && <Badge variant="outline" className="text-xs">Primary</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {duplicate.needs_fix && (
                    <Button
                      onClick={() => fixSpecificUser(duplicate.email)}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Wrench className="w-4 h-4" />
                      Fix This User
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
