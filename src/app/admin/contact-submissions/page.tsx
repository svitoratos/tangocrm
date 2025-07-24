import { ContactSubmissionsAdmin } from '@/components/app/contact-submissions-admin';
import { TangoHeader } from '@/components/app/tango-header';
import { AdminOnly } from '@/components/app/admin-only';

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