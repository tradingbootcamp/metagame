import { redirect } from 'next/navigation'

import { usersService } from '@/lib/db/users'

import { TEAM_COLORS_ENUM } from '@/utils/dbUtils'
import { authLevelsToRanks, getCurrentUserAuthRank } from '@/utils/security'
import { createClient } from '@/utils/supabase/server'

import TeamGrid from '@/components/sections/team/TeamGrid'

import { getCurrentUserFullProfile } from '@/app/actions/db/users'

import { DbTeamColor } from '@/types/database/dbTypeAliases'

type SearchParams = Promise<{ color?: string }>
export default async function TeamPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { color } = await searchParams
  // Ensure the user is logged in; otherwise, send to login
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/team')
  }
  const validatedColor =
    color &&
    (color === 'all' || TEAM_COLORS_ENUM.includes(color as DbTeamColor))
      ? (color as DbTeamColor | 'all')
      : null
  let team: DbTeamColor | 'all' | null = null
  if (
    (await getCurrentUserAuthRank()) >= authLevelsToRanks.GREEN &&
    validatedColor
  ) {
    team = validatedColor
  } else {
    const profile = await getCurrentUserFullProfile()
    team = profile?.team ?? null
  }
  if (!team || team === 'unassigned') {
    return (
      <section className="mb-[40px] pt-10 text-center">
        <div className="relative container mx-auto">
          <h2 className="mb-8 text-center text-3xl font-bold">Your Team</h2>
          <div className="text-muted-foreground">
            You haven&apos;t been assigned to a team yet.
          </div>
        </div>
      </section>
    )
  }
  const allProfiles = await usersService.getAllUserPublicProfiles()

  const teamMembers =
    team === 'all'
      ? allProfiles.sort((a, b) => (a.team < b.team ? -1 : 1))
      : allProfiles.filter((p) => p.team === team)
  const memberIds = teamMembers?.map((m) => m.id) || []

  return (
    <section className="mb-[40px] pt-10 text-center">
      <div className="relative container mx-auto">
        <h2 className="mb-8 text-center text-3xl font-bold">Your Team</h2>
        <div className="max-w-8xl mx-auto flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6">
          <TeamGrid memberIds={memberIds} />
        </div>
      </div>
    </section>
  )
}
