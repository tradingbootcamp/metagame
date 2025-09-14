import PlayerCard from '@/components/PlayerCard/PlayerCard'

import { getUserPublicProfileByPlayerId } from '@/app/actions/db/users'

type SearchParams = Promise<{ celestial?: boolean }>
export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: SearchParams
}) {
  const { celestial = false } = await searchParams
  const { id } = await params
  let uuid: string | null
  if (id.length === 4) {
    const profile = await getUserPublicProfileByPlayerId({
      playerId: parseInt(id),
    })
    uuid = profile?.id ?? null
  } else {
    uuid = id
  }
  return (
    <div className="flex w-full flex-col items-center gap-8 p-24">
      <PlayerCard
        userId={uuid}
        tiltFactor={2.5}
        gleamFollowsTilt
        asCelestialCard={celestial}
      />
    </div>
  )
}
