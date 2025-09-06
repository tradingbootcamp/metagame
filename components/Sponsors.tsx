import PartnerCard from './PartnerCard'

import { sponsors } from '@/utils/sponsors'

export default function Sponsors() {
  const allSponsors = sponsors

  const platinumSponsors = allSponsors.filter((s) => s.tier === 'platinum')
  const goldSponsors = allSponsors.filter((s) => s.tier === 'gold')
  const silverSponsors = allSponsors.filter((s) => s.tier === 'silver')
  const headlineSponsors = allSponsors.filter((s) => s.tier === 'headline')
  return (
    <section className="mb-20 flex flex-col" id="sponsors">
      <div className="flex w-full flex-col items-center justify-center">
        <h2 className="mb-8 text-3xl font-bold">Sponsors</h2>
        <div className="flex flex-col items-center justify-center gap-12">
          {/* Headline */}
          {headlineSponsors.length > 0 && (
            <div>
              <PartnerCard
                key={headlineSponsors[0].id}
                imgClass="w-[375px] h-[90px]"
                partner={headlineSponsors[0]}
              />
            </div>
          )}

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
