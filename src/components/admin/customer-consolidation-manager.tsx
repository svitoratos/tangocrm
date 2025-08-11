'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, Users, CreditCard } from 'lucide-react';

interface UserCustomerData {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  niches: string[] | null;
  subscription_status: string | null;
  created_at: string;
}

interface CustomerConsolidationStatus {
  totalUsers: number;
  usersWithCustomers: number;
  duplicateCustomers: number;
  consolidatedUsers: number;
}

export default function CustomerConsolidationManager() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserCustomerData[]>([]);
  const [status, setStatus] = useState<CustomerConsolidationStatus | null>(null);
  const [consolidating, setConsolidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/customer-consolidation-status');
      if (!response.ok) {
        throw new Error('Failed to load customer data');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setStatus(data.status || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const consolidateCustomers = async () => {
    try {
      setConsolidating(true);
      setError(null);

      const response = await fetch('/api/admin/consolidate-customers', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to consolidate customers');
      }

      const result = await response.json();
      
      if (result.success) {
        // Reload data to show updated status
        await loadCustomerData();
      } else {
        throw new Error(result.error || 'Consolidation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setConsolidating(false);
    }
  };

  const getCustomerStatusBadge = (user: UserCustomerData) => {
    if (!user.stripe_customer_id) {
      return <Badge variant="secondary">No Customer ID</Badge>;
    }
    
    // Check if this user has a unique customer ID
    const duplicateCount = users.filter(u => 
      u.stripe_customer_id === user.stripe_customer_id
    ).length;
    
    if (duplicateCount > 1) {
      return <Badge variant="destructive">Duplicate ({duplicateCount})</Badge>;
    }
    
    return <Badge variant="default">Unique</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading customer data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Consolidation Manager</h2>
        <Button 
          onClick={consolidateCustomers} 
          disabled={consolidating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {consolidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Consolidating...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Consolidate Customers
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Overview */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">With Customer IDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{status.usersWithCustomers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Duplicate Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{status.duplicateCustomers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Consolidated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{status.consolidatedUsers}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customer Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer ID Status</CardTitle>
          <CardDescription>
            Monitor customer ID consistency across all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Customer ID</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Niches</th>
                  <th className="text-left p-2">Subscription</th>
                  <th className="text-left p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{user.email}</td>
                    <td className="p-2 font-mono text-xs">
                      {user.stripe_customer_id || 'N/A'}
                    </td>
                    <td className="p-2">
                      {getCustomerStatusBadge(user)}
                    </td>
                    <td className="p-2">
                      {user.niches && user.niches.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.niches.map((niche) => (
                            <Badge key={niche} variant="outline" className="text-xs">
                              {niche}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No niches</span>
                      )}
                    </td>
                    <td className="p-2">
                      <Badge 
                        variant={user.subscription_status === 'active' ? 'default' : 'secondary'}
                      >
                        {user.subscription_status || 'inactive'}
                      </Badge>
                    </td>
                    <td className="p-2 text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How Customer Consolidation Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Automatic Detection</p>
              <p className="text-sm text-gray-600">
                The system automatically detects when users have multiple customer IDs
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Safe Merging</p>
              <p className="text-sm text-gray-600">
                Duplicate customers are safely merged, preserving all subscriptions
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Portal Access</p>
              <p className="text-sm text-gray-600">
                Users can access all subscriptions through a single customer portal
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
