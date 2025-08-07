import { PricingTable } from '@clerk/nextjs'

export default function ClerkPricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Get started with Tango CRM today
          </p>
        </div>
        
        <PricingTable />
      </div>
    </div>
  )
} 