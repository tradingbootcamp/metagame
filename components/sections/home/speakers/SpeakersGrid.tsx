'use client'

import { useEffect, useLayoutEffect, useState } from 'react'

import PlayerCard, {
  PlayerCardSkeleton,
} from '@/components/PlayerCard/PlayerCard'

import { usePublicProfiles } from '@/hooks/useProfiles'

interface SpeakersGridProps {
  speakerIds: string[]
}

// useLayoutEffect warns during SSR; fall back to useEffect there
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

// Smaller cards on mobile so the grid fits 3 per row instead of 2; PlayerCard
// scales everything off this width. Keyed to Tailwind's sm breakpoint.
// Layout effect so the mobile width lands before first paint instead of
// flashing 150px cards and shifting to 104px.
function useSpeakerCardWidth() {
  const [width, setWidth] = useState(150)
  useIsomorphicLayoutEffect(() => {
    const update = () => setWidth(window.innerWidth < 640 ? 104 : 150)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return width
}

export default function SpeakersGrid({ speakerIds }: SpeakersGridProps) {
  const cardWidth = useSpeakerCardWidth()
  const { profiles, profilesLoading, profilesError } = usePublicProfiles({
    userIds: speakerIds,
    includeFullProfiles: false,
  })

  // If no speaker IDs provided, show message immediately
  if (speakerIds.length === 0) {
    return (
      <div className="text-lg text-muted-foreground">No speakers found</div>
    )
  }

  // While the batch fetch is in flight, render one pending card frame per known
  // speaker. This reserves the grid's real height so the #speakers anchor never
  // briefly frames the Sponsors section, and the single batch request seeds each
  // card's cache — so the real cards below render straight from cache, with no
  // per-card re-fetch and no "loading→error" flash.
  if (profilesLoading) {
    return (
      <>
        {speakerIds.map((id) => (
          <PlayerCardSkeleton key={id} width={cardWidth} />
        ))}
      </>
    )
  }

  // Query failed
  if (profilesError) {
    return (
      <div className="text-lg text-muted-foreground">
        Error loading speakers
      </div>
    )
  }

  // Query succeeded but no profiles returned (shouldn't happen if speakerIds exist)
  if (!profiles || profiles.length === 0) {
    return (
      <div className="text-lg text-muted-foreground">No speakers found</div>
    )
  }

  return (
    <>
      {profiles.map((profile) => (
        <PlayerCard
          key={profile.id}
          userId={profile.id}
          asCelestialCard={false}
          tiltFactor={1}
          gleamFollowsTilt
          width={cardWidth}
          href={`/player/${profile.player_id}`}
        />
      ))}
    </>
  )
}
