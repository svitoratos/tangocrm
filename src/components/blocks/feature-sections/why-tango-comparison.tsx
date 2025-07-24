import { Check, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export function WhyTangoComparison() {
  const comparisonData: Array<{
    feature: string;
    tango: { status: 'yes' | 'no' | 'warning'; text: string };
    traditional: { status: 'yes' | 'no' | 'warning'; text: string };
  }> = [
    {
      feature: '🎯 Built for creators',
      tango: { status: 'yes', text: 'Yes' },
      traditional: { status: 'no', text: 'Sales-focused' }
    },
    {
      feature: '📹 Track content & campaigns',
      tango: { status: 'yes', text: 'Built-in' },
      traditional: { status: 'no', text: 'Not supported' }
    },
    {
      feature: '💼 Manage brand deals',
      tango: { status: 'yes', text: 'Creator-first pipeline' },
      traditional: { status: 'warning', text: 'Needs custom setup' }
    },
    {
      feature: '👥 Clients & sponsors in one place',
      tango: { status: 'yes', text: 'Unified CRM' },
      traditional: { status: 'warning', text: 'Fragmented tools' }
    },
    {
      feature: '📅 Visual content calendar',
      tango: { status: 'yes', text: 'Yes' },
      traditional: { status: 'no', text: 'Often missing' }
    },
    {
      feature: '📈 Track revenue from gigs/deals',
      tango: { status: 'yes', text: 'Simple dashboard' },
      traditional: { status: 'warning', text: 'Over-complicated' }
    },
    {
      feature: '🎨 Clean, intuitive design',
      tango: { status: 'yes', text: 'Built for creatives' },
      traditional: { status: 'no', text: 'Corporate UX' }
    },
    {
      feature: '💸 Transparent pricing',
              tango: { status: 'yes', text: '$39.99/month' },
      traditional: { status: 'no', text: 'Confusing tiered pricing' }
    },
    {
      feature: '🧠 Easy to use, no setup needed',
      tango: { status: 'yes', text: 'Plug & play' },
      traditional: { status: 'no', text: 'Steep learning curve' }
    }
  ];

  const getStatusIcon = (status: 'yes' | 'no' | 'warning') => {
    switch (status) {
      case 'yes':
        return <Check className="h-5 w-5 text-emerald-500" />;
      case 'no':
        return <X className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusColor = (status: 'yes' | 'no' | 'warning') => {
    switch (status) {
      case 'yes':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'no':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'warning':
        return 'text-orange-700 bg-orange-50 border-orange-200';
    }
  };

  return (
    <section className="pt-2 pb-12 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl">🎯</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              Why Tango?
            </h2>
          </div>
          <p className="text-xl font-semibold text-slate-700 mb-4">
            Finally, a CRM built for creators — not corporations.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed">
            Tango gives influencers, coaches, freelancers, and podcasters a simple way to manage brand deals, clients, content, and revenue — all in one place.
          </p>
          <p className="text-lg text-slate-600 mt-4">
            <strong>No clutter. No learning curve. Just your business, organized.</strong>
          </p>
          <div className="mt-6 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <blockquote className="text-lg italic text-slate-700 mb-2">
              "CRMs were built for corporations. Tango was built for creators building empires from their phones and laptops."
            </blockquote>
            <p className="text-sm font-medium text-slate-600">
              — Steven Vitoratos, Tango Founder
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mx-auto max-w-6xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white text-center">
                📊 Tango vs Traditional CRMs
              </h3>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">
                      Feature / Experience
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-700 border-b border-slate-200">
                      Tango CRM
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 border-b border-slate-200">
                      Traditional CRMs
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(row.tango.status)}`}>
                          {getStatusIcon(row.tango.status)}
                          {row.tango.text}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(row.traditional.status)}`}>
                          {getStatusIcon(row.traditional.status)}
                          {row.traditional.text}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Tango works the way you do.
              </h3>
              <p className="text-lg text-slate-600 mb-6">
                Creator-grade tools. No spreadsheets. Just momentum.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
                >
                  Join Tango
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
