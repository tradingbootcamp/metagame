import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Arbor',
  description:
    'Learn about the Arbor team - curious about markets, pedagogy, and game design',
}

export default function ArborContent() {
  return (
    <main>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="mb-8 text-center">
          <h1 className="mb-6 text-5xl font-bold text-secondary-200">Arbor</h1>
        </section>

        {/* Projects Section */}
        <section className="mx-auto mb-16 max-w-3xl">
          <div className="p-8 text-xl">
            Arbor is a team of people curious about markets, pedagogy, and game
            design, run by{' '}
            <a
              href="https://rickiheicklen.com"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              Ricki Heicklen
            </a>
            .
            <br />
            <br />
            Some projects of ours include:
            <ul className="mt-6 space-y-6 text-lg leading-relaxed text-gray-300">
              <li className="flex items-start">
                <span className="mr-3 text-secondary-200">•</span>
                <span>
                  A{' '}
                  <a
                    href="https://trading.camp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    trading bootcamp
                  </a>
                  , where we teach how to think like a trader using a play-money
                  economy and trading games
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-secondary-200">•</span>
                <span>
                  A{' '}
                  <a
                    href="https://arborsummer.camp/incubator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    pedagogy incubator
                  </a>
                  , helping people with good ideas turn those into bootcamps and
                  workshops
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-secondary-200">•</span>
                <span>
                  A{' '}
                  <Link
                    href="/?arbor-metagame=true"
                    className="text-secondary-500 transition-colors hover:text-fuchsia-500 hover:underline"
                  >
                    game design conference
                  </Link>{' '}
                  in Berkeley, CA this September
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Contact Section - commented out in original
        <section className="text-center mt-16">
          <p className="text-gray-300">
            Interested in working with us?{' '}
            <a 
              href="mailto:hello@arbor.com" 
              className="text-secondary-500 hover:text-fuchsia-500 hover:underline transition-colors"
            >
              Get in touch
            </a>
          </p>
        </section> */}
      </div>
    </main>
  )
}
