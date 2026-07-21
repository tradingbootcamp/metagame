import SpeakersGrid from './SpeakersGrid'

import { PlayerCardSkeleton } from '@/components/PlayerCard/PlayerCard'

import { getSpeakerIds } from '@/app/actions/db/users'

export default async function Speakers() {
  const speakers = await getSpeakerIds()
  const speakerIds = speakers?.map((s) => s.id) || []

  return (
    <section className="mb-[40px] pt-10 text-center" id="speakers">
      <div className="relative container mx-auto">
        <h2 className="mb-8 text-center text-3xl font-bold">Speakers</h2>
        <div className="max-w-8xl mx-auto flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6">
          <SpeakersGrid speakerIds={speakerIds} />
        </div>
      </div>
    </section>
  )
}

export function SpeakersLoading() {
  return (
    <section className="mb-[40px] pt-10 text-center" id="speakers">
      <div className="relative container mx-auto">
        <h2 className="mb-8 text-center text-3xl font-bold">Speakers</h2>

        <div className="max-w-8xl mx-auto flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6">
          {/* Pending card frames reserve vertical space before the speaker IDs
              resolve, so the #speakers anchor doesn't briefly frame Sponsors. */}
          {Array.from({ length: 12 }).map((_, i) => (
            <PlayerCardSkeleton key={i} width={150} />
          ))}
        </div>
      </div>
    </section>
  )
}
