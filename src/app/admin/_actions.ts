'use server'

import { checkRole } from '@/utils/roles'
import { clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function setRole(formData: FormData) {
  console.log('setRole called with:', Object.fromEntries(formData))
  
  const client = await clerkClient()

  // Check that the user trying to set the role is an admin
  if (!(await checkRole('admin'))) {
    console.log('Not authorized to set role')
    throw new Error('Not Authorized')
  }

  try {
    const userId = formData.get('id') as string
    const role = formData.get('role') as string
    
    console.log('Updating user:', userId, 'to role:', role)
    
    const updatedUser = await client.users.updateUser(userId, {
      publicMetadata: { role: role },
    })
    
    console.log('Successfully updated user role:', updatedUser.publicMetadata)
  } catch (err) {
    console.error('Error updating user role:', err)
    throw new Error(`Failed to update user role: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
  
  redirect('/admin')
}

export async function removeRole(formData: FormData) {
  console.log('removeRole called with:', Object.fromEntries(formData))
  
  const client = await clerkClient()

  // Check that the user trying to remove the role is an admin
  if (!(await checkRole('admin'))) {
    console.log('Not authorized to remove role')
    throw new Error('Not Authorized')
  }

  try {
    const userId = formData.get('id') as string
    
    console.log('Removing role from user:', userId)
    
    const updatedUser = await client.users.updateUser(userId, {
      publicMetadata: { role: null },
    })
    
    console.log('Successfully removed user role:', updatedUser.publicMetadata)
  } catch (err) {
    console.error('Error removing user role:', err)
    throw new Error(`Failed to remove user role: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
  
  redirect('/admin')
} 