'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import PlayerCard from '@/components/PlayerCard/PlayerCard'

import { usePublicProfiles } from '@/hooks/useProfiles'

interface SpeakersGridProps {
  speakerIds: string[]
}

// Smaller cards on mobile so the grid fits 3 per row instead of 2; PlayerCard
// scales everything off this width. Keyed to Tailwind's sm breakpoint.
function useSpeakerCardWidth() {
  const [width, setWidth] = useState(150)
  useEffect(() => {
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

  // Still loading profiles
  if (profilesLoading) {
    return (
      <div className="text-lg text-muted-foreground">Loading Speakers...</div>
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
        <div key={profile.id} className="relative">
          <Link
            className="absolute inset-0 z-0"
            href={`/player/${profile.player_id}`}
          />
          <div className="pointer-events-none relative">
            <PlayerCard
              userId={profile.id}
              asCelestialCard={false}
              tiltFactor={1}
              gleamFollowsTilt
              width={cardWidth}
            />
          </div>
        </div>
      ))}
    </>
  )
}
