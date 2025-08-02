import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import { redirect } from 'next/navigation'
import { checkRole } from '@/utils/roles'
import { SearchUsers } from './SearchUsers'
import { clerkClient } from '@clerk/nextjs/server'
import { removeRole, setRole } from './_actions'

export const metadata: Metadata = generateMetadata({
  title: 'Admin Dashboard - Tango CRM Administration',
  description: 'Tango CRM admin dashboard for managing users, roles, and platform administration. Restricted access for administrators only.',
  keywords: [
    'Tango CRM admin',
    'creator CRM administration',
    'CRM platform admin',
    'Tango CRM management',
    'creator business admin',
    'CRM platform administration',
    'Tango CRM user management'
  ],
  image: '/admin-og-image.jpg'
})

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>
}) {
  if (!(await checkRole('admin'))) {
    redirect('/')
  }

  const query = (await params.searchParams).search

  const client = await clerkClient()

  const users = query ? (await client.users.getUserList({ query })).data : []

  return (
    <>
      <p>This is the protected admin dashboard restricted to users with the `admin` role.</p>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Admin Tools</h2>
        <div className="flex gap-4">
          <a 
            href="/admin/contact-submissions" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            View Contact Submissions
          </a>
        </div>
      </div>

      <SearchUsers />

      {users.map((user) => {
        return (
          <div key={user.id}>
            <div>
              {user.firstName} {user.lastName}
            </div>

            <div>
              {
                user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
                  ?.emailAddress
              }
            </div>

            <div>{user.publicMetadata.role as string}</div>

            <form action={setRole}>
              <input type="hidden" value={user.id} name="id" />
              <input type="hidden" value="admin" name="role" />
              <button type="submit" style={{ backgroundColor: 'blue', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Make Admin
              </button>
            </form>

            <form action={setRole}>
              <input type="hidden" value={user.id} name="id" />
              <input type="hidden" value="moderator" name="role" />
              <button type="submit">Make Moderator</button>
            </form>

            <form action={removeRole}>
              <input type="hidden" value={user.id} name="id" />
              <button type="submit">Remove Role</button>
            </form>
          </div>
        )
      })}
    </>
  )
} 