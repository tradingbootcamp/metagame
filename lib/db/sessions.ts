import { dbGetHostsFromSession } from '@/utils/dbUtils'
import { createServiceClient } from '@/utils/supabase/service'

import {
  DbSessionInsert,
  DbSessionUpdate,
  FullDbSession,
} from '@/types/database/dbTypeAliases'

const sessionsSelectIncludes = `
*,
host_1:profiles!sessions_host_1_id_fkey (
  first_name,
  last_name,
  email
),
host_2:profiles!sessions_host_2_id_fkey (
  first_name,
  last_name,
  email
),
host_3:profiles!sessions_host_3_id_fkey (
  first_name,
  last_name,
  email
),
bookmarks:session_bookmarks!session_bookmarks_session_id_fkey (
user_id
),
rsvps:session_rsvps!session_rsvps_session_id_fkey (
  on_waitlist,
  user:profiles!session_rsvps_user_id_fkey (
    id,
    team
  )
),
location:locations!sessions_location_id_fkey (
  name
)
`
export const sessionsService = {
  getSessionById: async ({ sessionId }: { sessionId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('sessions')
      .select(sessionsSelectIncludes)
      .eq('id', sessionId)
      .single()
    if (error) {
      throw new Error(error.message)
    }
    return data satisfies FullDbSession
  },
  /** Check if a session is full */
  sessionIsFull: async ({ sessionId }: { sessionId: string }) => {
    const supabase = createServiceClient()
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('max_capacity, session_rsvps(count)')
      .eq('id', sessionId)
      .single()
    if (sessionError) {
      throw new Error(sessionError.message)
    }
    return (
      session.max_capacity !== null &&
      (session.session_rsvps[0].count || 0) >= session.max_capacity
    )
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

  /** Takes the earliest waitlist-joined user off the waitlist and returns their userId. No-op if the waitlist is empty. */
  popSessionWaitlist: async ({ sessionId }: { sessionId: string }) => {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('session_rsvps')
      .select('user_id')
      .eq('session_id', sessionId)
      .eq('on_waitlist', true)
      .limit(1)
      .order('created_at', { ascending: true })
    if (error) {
      throw new Error(error.message)
    }
    if (data.length === 0) {
      return
    }
    const userId = data[0].user_id
    const { error: updateError } = await supabase
      .from('session_rsvps')
      .update({ on_waitlist: false })
      .eq('user_id', userId)
      .eq('session_id', sessionId)
    if (updateError) {
      throw new Error(updateError.message)
    }
    return userId
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
      .select()
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    if (data && !data.on_waitlist) {
      await sessionsService.popSessionWaitlist({ sessionId })
    }
    return data
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
    const hasRsvp = await sessionsService.userHasRsvp({ sessionId, userId })
    if (hasRsvp) {
      return await sessionsService.unrsvpUserFromSession({ sessionId, userId })
    }
    return await sessionsService.rsvpUserToSession({ sessionId, userId })
  },

  /** RSVP a user to a session, putting them on the waitlist if it's full. No-op if the user already has an RSVP. */
  rsvpUserToSession: async ({
    sessionId,
    userId,
  }: {
    sessionId: string
    userId: string
  }) => {
    const supabase = createServiceClient()

    if (await sessionsService.userHasRsvp({ sessionId, userId })) {
      return
    }

    const sessionFull = await sessionsService.sessionIsFull({ sessionId })
    const { data, error } = await supabase
      .from('session_rsvps')
      .insert({
        user_id: userId,
        session_id: sessionId,
        on_waitlist: sessionFull,
      })
      .select()
    if (error) {
      throw new Error(error.message)
    }
    return data
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
    const { data, error } = await supabase.from('session_rsvps').select(`
        *,
        profiles (
          team
        )
      `)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  unrsvpUserFromAllSessions: async ({ userId }: { userId: string }) => {
    const userRsvps = await sessionsService.getUserRsvps({ userId })
    for (const rsvp of userRsvps) {
      await sessionsService.unrsvpUserFromSession({
        sessionId: rsvp.session_id!,
        userId,
      })
    }
  },

  getAllSessions: async () => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('sessions')
      .select(sessionsSelectIncludes)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  /** Get all sessions hosted by a user */
  getUsersHostedSessions: async ({ userId }: { userId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('sessions')
      .select(sessionsSelectIncludes)
      .or(
        `host_1_id.eq.${userId},host_2_id.eq.${userId},host_3_id.eq.${userId}`,
      )
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  getSingleSessionRsvps: async ({ sessionId }: { sessionId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('session_rsvps')
      .select(
        `
        *,
        profiles!user_id (
          team
        )
      `,
      )
      .eq('session_id', sessionId)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  /** Add a new event/session */
  addSession: async (payload: DbSessionInsert) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('sessions')
      .insert(payload)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  /** Update an existing event/session */
  updateSession: async ({
    sessionId,
    payload,
  }: {
    sessionId: string
    payload: DbSessionUpdate
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('sessions')
      .update(payload)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  /** Delete an event/session */
  deleteSession: async ({ sessionId }: { sessionId: string }) => {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      throw new Error(error.message)
    }
    return { success: true }
  },
  getSessionHosts: async ({ sessionId }: { sessionId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('sessions')
      .select(sessionsSelectIncludes)
      .eq('id', sessionId)
      .single()
    if (error) {
      throw new Error(error.message)
    }
    return dbGetHostsFromSession(data)
  },
}
