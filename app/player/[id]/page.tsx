import { usersService } from '@/lib/db/users'

import PlayerCard from '@/components/PlayerCard/PlayerCard'

type SearchParams = Promise<{ celestial?: string }>
export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: SearchParams
}) {
  // Search params are always strings, so compare against 'true' rather than
  // treating any present value (including 'false') as truthy
  const { celestial } = await searchParams
  const asCelestialCard = celestial === 'true'
  const { id } = await params
  let uuid: string | null
  if (id.length === 4) {
    const playerId = parseInt(id, 10)
    const profile = Number.isNaN(playerId)
      ? null
      : await usersService.getPublicProfileByPlayerId({ playerId })
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
        asCelestialCard={asCelestialCard}
      />
    </div>
  )
}
