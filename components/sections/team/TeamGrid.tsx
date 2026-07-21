'use client'

import { useMemo } from 'react'

import PlayerCard from '@/components/PlayerCard/PlayerCard'

import { usePublicProfiles } from '@/hooks/useProfiles'

interface TeamGridProps {
  memberIds: string[]
}

export default function TeamGrid({ memberIds }: TeamGridProps) {
  const { profiles, profilesLoading, profilesError } = usePublicProfiles({
    userIds: memberIds,
    includeFullProfiles: false,
  })

  // Shuffle within each team, memoized so cards don't reorder on refetches
  const teamSorted = useMemo(() => {
    if (!profiles) return []
    const shuffled = [...profiles]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    // Stable sort keeps the shuffled order within each team
    return shuffled.sort((a, b) => a.team.localeCompare(b.team))
  }, [profiles])

  // If no member IDs provided, show message immediately
  if (memberIds.length === 0) {
    return (
      <div className="text-lg text-muted-foreground">No team members found</div>
    )
  }

  // Still loading profiles
  if (profilesLoading) {
    return (
      <div className="text-lg text-muted-foreground">
        Loading team members...
      </div>
    )
  }

  // Query failed
  if (profilesError) {
    return (
      <div className="text-lg text-muted-foreground">
        Error loading team members
      </div>
    )
  }

  // Query succeeded but no profiles returned (shouldn't happen if memberIds exist)
  if (teamSorted.length === 0) {
    return (
      <div className="text-lg text-muted-foreground">No team members found</div>
    )
  }

  return (
    <>
      {teamSorted.map((member) => (
        <PlayerCard
          key={member.id}
          userId={member.id}
          asCelestialCard={true}
          tiltFactor={1}
          gleamFollowsTilt
          width={150}
          href={`/player/${member.player_id}`}
        />
      ))}
    </>
  )
}
