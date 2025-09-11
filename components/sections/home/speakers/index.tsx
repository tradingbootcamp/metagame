import SpeakersGrid from './SpeakersGrid'

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
          <div className="flex items-center justify-center p-8">
            <div className="text-lg text-muted-foreground">
              Loading Speakers...
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
