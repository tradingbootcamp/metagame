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
  getSessionsHostedByUser: async ({ userId }: { userId: string }) => {
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
