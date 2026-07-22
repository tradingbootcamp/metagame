import { dbGetHostsFromSession } from '@/utils/dbUtils'
import { createServiceClient } from '@/utils/supabase/service'

import {
  DbFullSession,
  DbSessionInsert,
  DbSessionUpdate,
  DbTeamColor,
} from '@/types/database/dbTypeAliases'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const sessionsSelectIncludes = `
*,
host_1:profiles!sessions_host_1_id_fkey (
  id,
  first_name,
  last_name
),
host_2:profiles!sessions_host_2_id_fkey (
  id,
  first_name,
  last_name
),
host_3:profiles!sessions_host_3_id_fkey (
  id,
  first_name,
  last_name
),
bookmarks:session_bookmarks!session_bookmarks_session_id_fkey (
user_id
),
rsvps:session_rsvps!session_rsvps_session_id_fkey (
  *,
  user:profiles!session_rsvps_user_id_fkey (
    id,
    team,
    first_name,
    last_name
  )
),
location:locations!sessions_location_id_fkey (
  id,
  name,
  map_info
),
megagame_location:megagame_locations!sessions_megagame_location_fkey (
  id,
  name
),
card_rewards:celestial_cards(
  *,
  details:session_card_rewards(loser_option)
)
`
export const sessionsService = {
  getSessionById: async ({ sessionId }: { sessionId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('sessions')
      .select(sessionsSelectIncludes)
      .eq('id', sessionId)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data satisfies DbFullSession | null
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
    // The .or() below interpolates userId into raw PostgREST filter syntax on a
    // service-role client, so anything but a literal uuid would let the caller
    // append filters of their own.
    if (!UUID_PATTERN.test(userId)) {
      throw new Error('Invalid user id')
    }
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

  declareWinningTeam: async ({
    sessionId,
    winningTeam,
  }: {
    sessionId: string
    winningTeam: DbTeamColor
  }) => {
    const supabase = createServiceClient()

    const { data: session, error } = await supabase
      .from('sessions')
      .select('megagame, winning_team, megagame_location')
      .eq('id', sessionId)
      .single()
    if (error) {
      throw new Error(error.message)
    }
    if (!session.megagame) {
      throw new Error('Session is not a megagame')
    }
    if (session.winning_team) {
      throw new Error('Winning team already declared')
    }

    if (session.megagame_location) {
      const { error: locationError } = await supabase
        .from('megagame_locations')
        .update({
          control: winningTeam,
        })
        .eq('id', session.megagame_location)
      if (locationError) {
        throw new Error(locationError.message)
      }
    }

    const { data, error: updateError } = await supabase
      .from('sessions')
      .update({
        winning_team: winningTeam,
        win_timestamp: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single()
    if (updateError) {
      throw new Error(updateError.message)
    }
    return data
  },
  /** Get a list of sessions whose victory timesamps are within the specified timewindow */
  getRecentWins: async ({
    timeWindow = 1000 * 60 * 15,
  }: {
    timeWindow?: number
  }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('sessions')
      .select('winning_team, win_timestamp')
      .gte('win_timestamp', new Date(Date.now() - timeWindow).toISOString())
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
}
