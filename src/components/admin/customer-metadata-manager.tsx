'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, Database, RefreshCw, Eye } from 'lucide-react';

interface CustomerMetadata {
  userId: string;
  email: string;
  customerId: string;
  databaseNiches: string[];
  stripeMetadata: Record<string, string>;
  customerCreated: number | null;
  totalSubscriptions: number;
  error?: string;
}

export default function CustomerMetadataManager() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerMetadata | null>(null);

  useEffect(() => {
    loadCustomerMetadata();
  }, []);

  const loadCustomerMetadata = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/customer-metadata');
      if (!response.ok) {
        throw new Error('Failed to load customer metadata');
      }

      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getConsolidationStatus = (customer: CustomerMetadata) => {
    if (customer.error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    
    const status = customer.stripeMetadata.consolidation_status;
    if (status === 'consolidated') {
      return <Badge variant="default">Consolidated</Badge>;
    } else if (status === 'active') {
      return <Badge variant="secondary">Active</Badge>;
    } else {
      return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getMetadataSummary = (metadata: Record<string, string>) => {
    const importantKeys = ['total_niches', 'niches', 'consolidation_status', 'last_consolidation'];
    return importantKeys.map(key => {
      if (metadata[key]) {
        return (
          <div key={key} className="text-sm">
            <span className="font-medium">{key}:</span> {metadata[key]}
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading customer metadata...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Metadata Manager</h2>
        <Button onClick={loadCustomerMetadata} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Consolidated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {customers.filter(c => c.stripeMetadata.consolidation_status === 'consolidated').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {customers.filter(c => c.stripeMetadata.consolidation_status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {customers.filter(c => c.error).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Metadata Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Metadata Status</CardTitle>
          <CardDescription>
            Monitor Stripe customer metadata and consolidation status
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
                  <th className="text-left p-2">Database Niches</th>
                  <th className="text-left p-2">Stripe Niches</th>
                  <th className="text-left p-2">Subscriptions</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customerId} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{customer.email}</td>
                    <td className="p-2 font-mono text-xs">
                      {customer.customerId}
                    </td>
                    <td className="p-2">
                      {getConsolidationStatus(customer)}
                    </td>
                    <td className="p-2">
                      {customer.databaseNiches.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {customer.databaseNiches.map((niche) => (
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
                      {customer.stripeMetadata.niches ? (
                        <div className="flex flex-wrap gap-1">
                          {JSON.parse(customer.stripeMetadata.niches).map((niche: string) => (
                            <Badge key={niche} variant="outline" className="text-xs">
                              {niche}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No metadata</span>
                      )}
                    </td>
                    <td className="p-2">
                      <Badge variant="secondary">
                        {customer.totalSubscriptions}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Metadata Detail Modal */}
      {selectedCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Metadata Details</CardTitle>
            <CardDescription>
              {selectedCustomer.email} - {selectedCustomer.customerId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Database Information</h4>
                <div className="space-y-1 text-sm">
                  <div>User ID: {selectedCustomer.userId}</div>
                  <div>Niches: {selectedCustomer.databaseNiches.join(', ') || 'None'}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Stripe Information</h4>
                <div className="space-y-1 text-sm">
                  <div>Created: {selectedCustomer.customerCreated ? new Date(selectedCustomer.customerCreated * 1000).toLocaleDateString() : 'Unknown'}</div>
                  <div>Subscriptions: {selectedCustomer.totalSubscriptions}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Stripe Metadata</h4>
              <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                {Object.entries(selectedCustomer.stripeMetadata).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                ))}
                {Object.keys(selectedCustomer.stripeMetadata).length === 0 && (
                  <span className="text-gray-500">No metadata found</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedCustomer(null)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How Metadata Consolidation Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Automatic Tracking</p>
              <p className="text-sm text-gray-600">
                Customer metadata automatically tracks niches, consolidation status, and merge history
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Consolidation History</p>
              <p className="text-sm text-gray-600">
                Metadata preserves information about which customers were merged and when
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Audit Trail</p>
              <p className="text-sm text-gray-600">
                Complete audit trail of customer changes and consolidation operations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
