import { Roles } from '../types/globals'
import { auth } from '@clerk/nextjs/server'

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth()
  console.log('checkRole called with role:', role)
  console.log('sessionClaims:', sessionClaims)
  console.log('user role:', sessionClaims?.metadata?.role)
  const result = sessionClaims?.metadata?.role === role
  console.log('checkRole result:', result)
  return result
} 