import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { checkRole } from '@/utils/roles';

export async function GET() {
  try {
    // Check if the requesting user is an admin
    if (!(await checkRole('admin'))) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const client = await clerkClient();
    
    // Get all users
    const usersResponse = await client.users.getUserList({
      limit: 100,
    });

    // Extract user data with roles
    const usersWithRoles = usersResponse.data.map((user: any) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      publicMetadata: user.publicMetadata,
      createdAt: user.createdAt,
    }));

    return NextResponse.json({
      users: usersWithRoles,
      total: usersWithRoles.length,
      adminUsers: usersWithRoles.filter((user: any) => user.publicMetadata?.role === 'admin')
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check if the requesting user is an admin
    if (!(await checkRole('admin'))) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { userId, action } = await request.json();
    const client = await clerkClient();

    if (action === 'removeAdmin') {
      // Remove admin role from user
      await client.users.updateUser(userId, {
        publicMetadata: { role: null },
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Admin role removed successfully' 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
} 