import { Calendar, TrendingUp, Workflow } from 'lucide-react'

const features = [
  {
    name: 'Drag & Drop Pipelines',
    description:
      'Customized pipeline for each niche with our intuitive visual pipeline builder. Design workflows that match your unique business process.',
    href: '#',
    icon: Workflow,
  },
  {
    name: 'Smart Analytics',
    description:
      'Get insights that matter to your business model. Track performance metrics, conversion rates, and revenue optimization across all your niches.',
    href: '#',
    icon: TrendingUp,
  },
  {
    name: 'Visual Calendar',
    description:
      'Track your content schedule, client meetings, and project deadlines in one beautiful calendar view. Stay organized and never miss important dates.',
    href: '#',
    icon: Calendar,
  },
]

export default function SimpleThreeColumnWithLargeIcons() {
  return (
    <div id="about" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-slate-800 sm:text-5xl">
            Everything You Need to Scale
          </h2>
        </div>
        <div className="mx-auto mt-12 max-w-2xl sm:mt-16 lg:mt-20 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="text-base/7 font-semibold text-slate-800">
                  <div className={`mb-6 flex size-10 items-center justify-center rounded-lg ${
                    index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-orange-500' : 'bg-emerald-500'
                  }`}>
                    <feature.icon aria-hidden="true" className="size-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base/7 text-slate-600">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    <a href={feature.href} className="text-sm/6 font-semibold text-emerald-600 hover:text-emerald-500">
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}