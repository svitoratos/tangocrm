import Link from 'next/link'

export default function SimpleJustified() {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
          <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Ready to dive in?
            <br />
            Join Tango today.
          </h2>
          <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:shrink-0">
            <Link
              href="/sign-up"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {' '}
              Get started{' '}
            </Link>
            <Link href="/about" className="text-sm/6 font-semibold text-gray-900 hover:opacity-80">
              Learn more
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }
  