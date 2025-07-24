import { auth } from '@clerk/nextjs/server'

export type Roles = 'admin' | 'user'

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth()
  const result = sessionClaims?.metadata?.role === role
  return result
} 