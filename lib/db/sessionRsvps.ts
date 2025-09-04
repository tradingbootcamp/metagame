import { sessionsService } from './sessions'

import { createServiceClient } from '@/utils/supabase/service'

import { DbFullSessionRsvp } from '@/types/database/dbTypeAliases'

const sessionRsvpsSelectIncludes = `
        *,
        user:profiles!session_rsvps_user_id_fkey (
          id,
          team,
          first_name,
          last_name
        )
      `
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
      .select(sessionRsvpsSelectIncludes)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    if (data && !data.on_waitlist) {
      await sessionRsvpsService.popSessionWaitlist({ sessionId })
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

  /** RSVP a user to a session, putting them on the waitlist if it's full. No-op if the user already has an RSVP. */
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

    const sessionFull = await sessionsService.sessionIsFull({ sessionId }) // TODO: use sessionRsvpsService.sessionIsFull
    const { data, error } = await supabase
      .from('session_rsvps')
      .insert({
        user_id: userId,
        session_id: sessionId,
        on_waitlist: sessionFull,
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
