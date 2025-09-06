import PartnerCard from './PartnerCard'
import Image from 'next/image'

import { getSponsors } from '@/lib/content'

export default async function Sponsors() {
  const sponsors = await getSponsors()

  const platinumSponsors = sponsors.filter((s) => s.tier === 'platinum')
  const goldSponsors = sponsors.filter((s) => s.tier === 'gold')
  const silverSponsors = sponsors.filter((s) => s.tier === 'silver')
  return (
    <section className="mb-20 flex flex-col" id="sponsors">
      <div className="flex w-full flex-col items-center justify-center">
        <h2 className="mb-8 text-3xl font-bold">Sponsors</h2>
        <div className="flex flex-col items-center justify-center gap-12">
          {/* Headline */}
          <div>
            <h3 className="mb-2 text-center text-2xl font-bold text-white">
              Headline
            </h3>
            {/* Bitcoin logo image size ratio is 1920/456 */}
            <a href="https://www.bitcoin.org/">
              <Image
                src="/logos/bitcoin-white.png"
                alt="Bitcoin"
                height={90}
                width={375}
                className="mt-6"
              />
            </a>
          </div>
          {/* Platinum */}
          {platinumSponsors.length > 0 && (
            <div className="flex w-full flex-col items-center">
              <h3 className="mb-8 text-center text-2xl font-bold text-white">
                Platinum
              </h3>
              <div className="grid max-w-2xl grid-cols-1 gap-8">
                {platinumSponsors
                  .sort((a, b) => a.id - b.id)
                  .map((sponsor) => (
                    <PartnerCard
                      key={sponsor.id}
                      imgClass="h-32 sm:h-40 lg:h-48 w-auto max-w-full"
                      partner={sponsor}
                    />
                  ))}
              </div>
            </div>
          )}
          {/* Gold */}
          {goldSponsors.length > 0 && (
            <div className="flex w-full flex-col items-center">
              <h3 className="mb-8 text-center text-2xl font-bold text-yellow-400">
                Gold
              </h3>
              <div
                className={`grid gap-12 ${
                  goldSponsors.length === 1
                    ? 'max-w-3xl grid-cols-1'
                    : 'max-w-4xl grid-cols-1 md:grid-cols-2'
                }`}
              >
                {goldSponsors
                  .sort((a, b) => a.id - b.id)
                  .map((sponsor) => (
                    <PartnerCard
                      key={sponsor.id}
                      imgClass="h-48 w-full lg:w-auto lg:h-64 max-w-full"
                      partner={sponsor}
                    />
                  ))}
              </div>
            </div>
          )}
          {/* Silver */}
          {silverSponsors.length > 0 && (
            <div className="flex w-full flex-col items-center">
              <h3 className="text-center text-2xl font-bold text-gray-300">
                Silver
              </h3>
              <div
                className={`grid md:gap-16 ${
                  silverSponsors.length === 1
                    ? 'max-w-md grid-cols-1'
                    : silverSponsors.length === 2
                      ? 'max-w-4xl grid-cols-1 md:grid-cols-2'
                      : 'max-w-5xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {silverSponsors
                  .sort((a, b) => a.id - b.id)
                  .map((sponsor) => (
                    <PartnerCard
                      key={sponsor.id}
                      imgClass="h-24 sm:h-40 md:h-48 lg:h-48 w-full"
                      partner={sponsor}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
