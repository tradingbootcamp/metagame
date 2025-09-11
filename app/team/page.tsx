import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

import TeamGrid from '@/components/sections/team/TeamGrid'

import {
  getCurrentUserFullProfile,
  getUsersIdsByTeam,
} from '@/app/actions/db/users'

export default async function TeamPage() {
  // Ensure the user is logged in; otherwise, send to login
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/team')
  }

  const profile = await getCurrentUserFullProfile()
  const team = profile?.team

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

  const teamMembers = await getUsersIdsByTeam({ team })
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
