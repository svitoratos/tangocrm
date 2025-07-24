import { TangoContactForm } from '@/components/blocks/contact-forms/tango-contact-form'
import { FooterWithGrid } from '@/components/blocks/footers/footer-with-grid'
import { TangoHeader } from '@/components/app/tango-header'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <TangoHeader />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-purple-50 py-20 sm:py-24">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23e5e7eb%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Get in Touch
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Ready to transform your creator business? Our team is here to help you get started 
              and make the most of Tango's powerful CRM platform.
            </p>
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-slate-500">
              <span className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-emerald-500"></div>
                Typically responds in 24 hours
              </span>
              <span className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-purple-500"></div>
                Free consultation available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="py-16 sm:py-20">
        <TangoContactForm />
      </div>



      {/* Footer */}
      <FooterWithGrid />
    </div>
  )
} 