"use client"

import { Check } from 'lucide-react'
import Link from 'next/link'

const tiers = [
  {
    id: 'starter',
    name: 'Starter',
    price: { monthly: '$19', annually: '$199' },
    description: 'Perfect for creators just getting started with their first niche.',
    features: [
      '1 niche',
      '500 contacts',
      'Basic analytics',
      'Email support',
      'Pipeline customization',
      'Niche templates'
    ],
    featured: false,
    cta: 'Join Tango',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: { monthly: '$39', annually: '$399' },
    description: 'Scale your creator business across multiple niches with advanced tools.',
    features: [
      '3 niches',
      '2,000 contacts',
      'Advanced analytics',
      'Priority support',
      'Custom fields',
      'Pipeline customization',
      'Niche templates',
      'Client portal access'
    ],
    featured: true,
    cta: 'Join Tango',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: { monthly: '$79', annually: '$799' },
    description: 'Everything you need to run a full-scale creator business empire.',
    features: [
      'Unlimited niches',
      'Unlimited contacts',
      'Advanced analytics',
      'Dedicated support',
      'API access',
      'White-label options',
      'Pipeline customization',
      'Niche templates',
      'Client portal access'
    ],
    featured: false,
    cta: 'Join Tango',
  },
]

export default function ThreeTiersWithEmphasizedTier() {
  return (
    <div className="group/tiers bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base/7 font-semibold text-emerald-600">Pricing</h2>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-slate-900 sm:text-6xl">
            Creator CRM built for growth
          </p>
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg font-medium text-pretty text-slate-600 sm:text-xl/8">
          Choose a plan that scales with your creator business and helps you manage your audience like a pro.
        </p>
        <div className="mt-12 flex justify-center">
          <fieldset aria-label="Payment frequency">
            <div className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs/5 font-semibold ring-1 ring-slate-200 ring-inset">
              <label className="group relative rounded-full px-2.5 py-1 has-checked:bg-emerald-600">
                <input
                  defaultValue="monthly"
                  defaultChecked
                  name="frequency"
                  type="radio"
                  className="absolute inset-0 appearance-none rounded-full"
                />
                <span className="text-slate-500 group-has-checked:text-white">Monthly</span>
              </label>
              <label className="group relative rounded-full px-2.5 py-1 has-checked:bg-emerald-600">
                <input
                  defaultValue="annually"
                  name="frequency"
                  type="radio"
                  className="absolute inset-0 appearance-none rounded-full"
                />
                <span className="text-slate-500 group-has-checked:text-white">Annually</span>
              </label>
            </div>
          </fieldset>
        </div>
        <div className="isolate mx-auto mt-8 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              data-featured={tier.featured ? 'true' : undefined}
              className="group/tier rounded-3xl p-8 ring-1 ring-slate-200 data-featured:bg-emerald-600 data-featured:ring-emerald-600 xl:p-10"
            >
              <h3
                id={`tier-${tier.id}`}
                className="text-lg/8 font-semibold text-slate-900 group-data-featured/tier:text-white"
              >
                {tier.name}
              </h3>
              <p className="mt-4 text-sm/6 text-slate-600 group-data-featured/tier:text-emerald-50">{tier.description}</p>
              {typeof tier.price === 'string' ? (
                <p className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 group-data-featured/tier:text-white">
                  {tier.price}
                </p>
              ) : (
                <>
                  <p className="mt-6 flex items-baseline gap-x-1 group-not-has-[[name=frequency][value=monthly]:checked]/tiers:hidden">
                    <span className="text-4xl font-semibold tracking-tight text-slate-900 group-data-featured/tier:text-white">
                      {tier.price.monthly}
                    </span>
                    <span className="text-sm/6 font-semibold text-slate-600 group-data-featured/tier:text-emerald-100">
                      /month
                    </span>
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1 group-not-has-[[name=frequency][value=annually]:checked]/tiers:hidden">
                    <span className="text-4xl font-semibold tracking-tight text-slate-900 group-data-featured/tier:text-white">
                      {tier.price.annually}
                    </span>
                    <span className="text-sm/6 font-semibold text-slate-600 group-data-featured/tier:text-emerald-100">
                      /year
                    </span>
                  </p>
                </>
              )}

              <Link
                href="/sign-up"
                className="mt-6 block w-full rounded-md bg-emerald-600 px-3 py-2 text-center text-sm/6 font-semibold text-white shadow-xs group-data-featured/tier:bg-white/10 group-data-featured/tier:text-white hover:bg-emerald-500 group-data-featured/tier:hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 group-data-featured/tier:focus-visible:outline-white"
              >
                {tier.cta}
              </Link>
              <ul
                role="list"
                className="mt-8 space-y-3 text-sm/6 text-slate-600 group-data-featured/tier:text-emerald-50 xl:mt-10"
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check
                      aria-hidden="true"
                      className="h-6 w-5 flex-none text-emerald-600 group-data-featured/tier:text-white"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}