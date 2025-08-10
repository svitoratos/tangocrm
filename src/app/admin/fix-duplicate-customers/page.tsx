import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import { redirect } from 'next/navigation'
import { checkRole } from '@/utils/roles'
import { DuplicateCustomerFixer } from '@/components/admin/duplicate-customer-fixer'

export const metadata: Metadata = generateMetadata({
  title: 'Fix Duplicate Customers - Admin Dashboard',
  description: 'Admin tool to fix duplicate Stripe customer IDs and ensure one customer per user.',
  keywords: ['admin', 'stripe', 'customer', 'duplicate', 'fix']
})

export default async function FixDuplicateCustomersPage() {
  const isAdmin = await checkRole('admin');
  
  if (!isAdmin) {
    redirect('/')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Fix Duplicate Stripe Customers
        </h1>
        <p className="text-gray-600">
          This tool helps identify and fix users with multiple Stripe customer IDs, ensuring each user has only one customer ID.
        </p>
      </div>

      <DuplicateCustomerFixer />
    </div>
  )
}
