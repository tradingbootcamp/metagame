import { sessionsService } from './sessions'

import { usersService } from '@/lib/db/users'

import { createServiceClient } from '@/utils/supabase/service'

import { DbFullSessionRsvp, DbTeamColor } from '@/types/database/dbTypeAliases'

const sessionRsvpsSelectIncludes = `
        *,
        user:profiles!session_rsvps_user_id_fkey (
          id,
          team,
          first_name,
          last_name
        )
      `

// Private helpers (module-scoped) -------------------------------------------
const countGoingForTeam = async ({
  sessionId,
  team,
}: {
  sessionId: string
  team: DbTeamColor
}) => {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('session_rsvps')
    .select('on_waitlist, user:profiles!session_rsvps_user_id_fkey ( team )')
    .eq('session_id', sessionId)
    .eq('on_waitlist', false)
    .eq('user.team', team)
  if (error) throw new Error(error.message)
  return data.length
}

const countGoing = async ({ sessionId }: { sessionId: string }) => {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('session_rsvps')
    .select('id')
    .eq('session_id', sessionId)
    .eq('on_waitlist', false)
  if (error) throw new Error(error.message)
  return data.length
}

const getSessionCapacityAndType = async ({
  sessionId,
}: {
  sessionId: string
}): Promise<{ max_capacity: number | null; megagame: boolean }> => {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('max_capacity, megagame')
    .eq('id', sessionId)
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return { max_capacity: data.max_capacity, megagame: !!data.megagame }
}

export const sessionRsvpsService = {
  getSessionRsvps: async ({ sessionId }: { sessionId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('session_rsvps')
      .select(sessionRsvpsSelectIncludes)
      .eq('session_id', sessionId)
    if (error) {
      throw new Error(error.message)
    }
    return data satisfies DbFullSessionRsvp[]
  },
  getSingleSessionRsvps: async ({ sessionId }: { sessionId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('session_rsvps')
      .select(sessionRsvpsSelectIncludes)
      .eq('session_id', sessionId)
    if (error) {
      throw new Error(error.message)
    }
    return data satisfies DbFullSessionRsvp[]
  },
  /**
   * Pop earliest waitlisted users, optionally filtered by team, up to `limit`.
   * Returns array of userIds popped. No-op (empty array) if none.
   */
  popSessionWaitlist: async ({
    sessionId,
    team,
    limit = 1,
  }: {
    sessionId: string
    team?: DbTeamColor
    limit?: number
  }) => {
    const supabase = createServiceClient()

    let query = supabase
      .from('session_rsvps')
      .select(
        'user_id, user:profiles!session_rsvps_user_id_fkey ( team ), created_at',
      )
      .eq('session_id', sessionId)
      .eq('on_waitlist', true)
      .order('created_at', { ascending: true })
      .limit(limit)
    if (team) {
      // Filter by team of the joined profile
      query = query.eq('user.team', team)
    }
    const { data, error } = await query
    if (error) {
      throw new Error(error.message)
    }
    if (!data || data.length === 0) {
      return [] as string[]
    }
    const userIds = data.map((row) => row.user_id)
    const { error: updateError } = await supabase
      .from('session_rsvps')
      .update({ on_waitlist: false })
      .in('user_id', userIds)
      .eq('session_id', sessionId)
    if (updateError) {
      throw new Error(updateError.message)
    }
    return userIds
  },
  /** Un-RSVP a user from a session. If they were not on the waitlist, tries to pop the earlier waitlist user off waitlist. */
  unrsvpUserFromSession: async ({
    sessionId,
    userId,
  }: {
    sessionId: string
    userId: string
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('session_rsvps')
      .delete()
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .select(sessionRsvpsSelectIncludes)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    if (data && !data.on_waitlist) {
      // Fill from waitlist depending on session type
      const { max_capacity, megagame } = await getSessionCapacityAndType({
        sessionId,
      })

      if (!megagame) {
        // For non-megagame, compute how many open slots exist and pop that many
        if (max_capacity && max_capacity > 0) {
          const goingCount = await countGoing({ sessionId })
          const openSlots = Math.max(0, max_capacity - goingCount)
          if (openSlots > 0) {
            await sessionRsvpsService.popSessionWaitlist({
              sessionId,
              limit: openSlots,
            })
          }
        } else {
          // No capacity limit — pop one conservatively if any waitlist exists
          await sessionRsvpsService.popSessionWaitlist({ sessionId, limit: 1 })
        }
      } else {
        const team = data.user?.team
        if (!team) return data
        // Compute open slots for this team
        if (max_capacity && max_capacity > 0) {
          const teamCap = Math.floor(max_capacity / 2)
          const currentTeamGoing = await countGoingForTeam({ sessionId, team })
          const openSlots = Math.max(0, teamCap - currentTeamGoing)
          if (openSlots > 0) {
            await sessionRsvpsService.popSessionWaitlist({
              sessionId,
              team,
              limit: openSlots,
            })
          }
        } else {
          await sessionRsvpsService.popSessionWaitlist({
            sessionId,
            team,
            limit: 1,
          })
        }
      }
    }
    return data satisfies DbFullSessionRsvp | null
  },
  /** Check if a user has an RSVP for a session */
  userHasRsvp: async ({
    sessionId,
    userId,
  }: {
    sessionId: string
    userId: string
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('session_rsvps')
      .select()
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data !== null
  },

  /** Toggle a user's RSVP status for a session */
  toggleUserRsvpForSession: async ({
    sessionId,
    userId,
  }: {
    sessionId: string
    userId: string
  }) => {
    const hasRsvp = await sessionRsvpsService.userHasRsvp({ sessionId, userId })
    if (hasRsvp) {
      return await sessionRsvpsService.unrsvpUserFromSession({
        sessionId,
        userId,
      })
    }
    return await sessionRsvpsService.rsvpUserToSession({ sessionId, userId })
  },

  /** RSVP a user to a session. For megagame sessions, enforce per-team caps (half of max). Put on waitlist when team side is full. No-op if already RSVPd. */
  rsvpUserToSession: async ({
    sessionId,
    userId,
  }: {
    sessionId: string
    userId: string
  }) => {
    const supabase = createServiceClient()

    if (await sessionRsvpsService.userHasRsvp({ sessionId, userId })) {
      return
    }

    // Determine waitlist based on session type
    const { max_capacity, megagame } = await getSessionCapacityAndType({
      sessionId,
    })

    let on_waitlist = false
    if (!megagame) {
      const sessionFull = await sessionsService.sessionIsFull({ sessionId })
      on_waitlist = sessionFull
    } else {
      const userTeam = (
        await usersService.getUserPublicProfileById({
          userId,
        })
      )?.team
      if (userTeam === 'green') {
        throw new Error("Green team can't RSVP for megagame sessions.")
      }
      if (userTeam === 'unassigned' || !userTeam) {
        throw new Error(
          "Unassigned team can't RSVP for megagame sessions. Reach out if you haven't been assigned a team.",
        )
      }
      if (max_capacity && max_capacity > 0) {
        const teamCap = Math.floor(max_capacity / 2)
        const currentTeamGoing = await countGoingForTeam({
          sessionId,
          team: userTeam as DbTeamColor,
        })
        on_waitlist = currentTeamGoing >= teamCap
      } else {
        on_waitlist = false
      }
    }

    const { data, error } = await supabase
      .from('session_rsvps')
      .insert({
        user_id: userId,
        session_id: sessionId,
        on_waitlist,
      })
      .select(sessionRsvpsSelectIncludes)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data satisfies DbFullSessionRsvp | null
  },

  getUserRsvps: async ({ userId }: { userId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('session_rsvps')
      .select('*')
      .eq('user_id', userId)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  getAllRsvps: async () => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('session_rsvps')
      .select(sessionRsvpsSelectIncludes)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  unrsvpUserFromAllSessions: async ({ userId }: { userId: string }) => {
    const userRsvps = await sessionRsvpsService.getUserRsvps({ userId })
    for (const rsvp of userRsvps) {
      await sessionRsvpsService.unrsvpUserFromSession({
        sessionId: rsvp.session_id!,
        userId,
      })
    }
  },
  getAllSessionRsvpCounts: async () => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('sessions')
      .select('id, session_rsvps(count)')
    if (error) {
      throw new Error(error.message)
    }
    return data.map((session) => ({
      id: session.id,
      rsvp_count: session.session_rsvps[0].count,
    }))
  },
}
