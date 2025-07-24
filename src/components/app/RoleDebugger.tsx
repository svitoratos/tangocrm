"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  publicMetadata: any;
  createdAt: string;
}

interface RoleData {
  users: User[];
  total: number;
  adminUsers: User[];
}

export default function RoleDebugger() {
  const [roleData, setRoleData] = useState<RoleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/check-roles');
      if (response.ok) {
        const data = await response.json();
        setRoleData(data);
      } else {
        setError('Failed to fetch role data');
      }
    } catch (err) {
      setError('Error fetching role data');
    } finally {
      setLoading(false);
    }
  };

  const removeAdminRole = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/check-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'removeAdmin'
        }),
      });

      if (response.ok) {
        // Refresh the data
        await fetchRoles();
      } else {
        setError('Failed to remove admin role');
      }
    } catch (err) {
      setError('Error removing admin role');
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  if (loading) {
    return <div>Loading role data...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        Error: {error}
        <Button onClick={fetchRoles} className="ml-2">Retry</Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Role Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p>Total Users: {roleData?.total}</p>
              <p>Admin Users: {roleData?.adminUsers.length}</p>
            </div>
            <Button onClick={fetchRoles}>Refresh</Button>
          </div>

          {roleData?.adminUsers && roleData.adminUsers.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Admin Users:</h3>
              <div className="space-y-2">
                {roleData.adminUsers.map((user) => (
                  <div key={user.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-gray-600">
                        {user.firstName} {user.lastName} (ID: {user.id})
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeAdminRole(user.id)}
                    >
                      Remove Admin
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">All Users:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {roleData?.users?.map((user) => (
                <div key={user.id} className="p-2 border rounded">
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-600">
                    Role: {user.publicMetadata?.role || 'none'} | 
                    {user.firstName} {user.lastName} | 
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 