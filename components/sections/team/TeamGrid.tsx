'use client'

import Link from 'next/link'

import PlayerCard from '@/components/PlayerCard'

import { usePublicProfiles } from '@/hooks/useProfiles'

interface TeamGridProps {
  memberIds: string[]
}

export default function TeamGrid({ memberIds }: TeamGridProps) {
  const { profiles, profilesLoading, profilesError } = usePublicProfiles({
    userIds: memberIds,
    includeFullProfiles: false,
  })

  if (profilesLoading) {
    return (
      <div className="text-lg text-muted-foreground">
        Loading team members...
      </div>
    )
  }

  if (profilesError || !profiles) {
    return (
      <div className="text-lg text-muted-foreground">
        Error loading team members
      </div>
    )
  }

  // Shuffle the profiles client-side for randomization
  const shuffledProfiles = [...profiles].sort(() => Math.random() - 0.5)

  return (
    <>
      {shuffledProfiles.map((member) => (
        <div key={member.id} className="relative">
          <Link
            className="absolute inset-0 z-0"
            href={`/profile/${member.player_id}`}
          />
          <div className="pointer-events-none relative">
            <PlayerCard
              userId={member.id}
              asProfile
              tiltFactor={1}
              gleamFollowsTilt
              showStatBoxes={true}
              width={150}
            />
          </div>
        </div>
      ))}
    </>
  )
}
