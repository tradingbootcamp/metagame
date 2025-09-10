import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

import {
  getCurrentUserFullProfile,
  getPublicProfilesByTeam,
} from '@/app/actions/db/users'
import PlayerCard from '@/app/profile/PlayerCard'

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

  // Prefetch public profiles for all team members and seed the query cache
  const queryClient = new QueryClient()
  const members = await getPublicProfilesByTeam({ team })
  members.forEach((p) => {
    queryClient.setQueryData(['users', 'profile', p.id], p)
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="mb-[40px] pt-10 text-center">
        <div className="relative container mx-auto">
          <h2 className="mb-8 text-center text-3xl font-bold">Your Team</h2>

          <div className="max-w-8xl mx-auto flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6">
            {members?.map((member) => (
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
                    width={150}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </HydrationBoundary>
  )
}
