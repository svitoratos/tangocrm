import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import { ContactSubmissionsAdmin } from '@/components/app/contact-submissions-admin';
import { TangoHeader } from '@/components/app/tango-header';
import { AdminOnly } from '@/components/app/admin-only';

export const metadata: Metadata = generateMetadata({
  title: 'Contact Submissions - Tango CRM Admin',
  description: 'View and manage contact form submissions in Tango CRM admin panel. Monitor customer inquiries and support requests for the creator CRM platform.',
  keywords: [
    'Tango CRM contact submissions',
    'creator CRM admin',
    'CRM platform contact management',
    'Tango CRM customer inquiries',
    'creator business admin',
    'CRM platform submissions',
    'Tango CRM support requests'
  ],
  image: '/admin-contact-og-image.jpg'
})

export default function ContactSubmissionsPage() {
  return (
    <AdminOnly>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <TangoHeader />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ContactSubmissionsAdmin />
        </div>
      </div>
    </AdminOnly>
  );
} 