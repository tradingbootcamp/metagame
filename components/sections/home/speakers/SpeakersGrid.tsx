'use client'

import Link from 'next/link'

import PlayerCard from '@/components/PlayerCard'

import { usePublicProfiles } from '@/hooks/useProfiles'

interface SpeakersGridProps {
  speakerIds: string[]
}

export default function SpeakersGrid({ speakerIds }: SpeakersGridProps) {
  const { profiles, profilesLoading, profilesError } = usePublicProfiles({
    userIds: speakerIds,
    includeFullProfiles: false,
  })

  if (profilesLoading) {
    return (
      <div className="text-lg text-muted-foreground">Loading Speakers...</div>
    )
  }

  if (profilesError || !profiles) {
    return (
      <div className="text-lg text-muted-foreground">
        Error loading speakers
      </div>
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
              asProfile
              tiltFactor={1}
              gleamFollowsTilt
              width={150}
            />
          </div>
        </div>
      ))}
    </>
  )
}
