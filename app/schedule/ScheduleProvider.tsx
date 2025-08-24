import { getAllLocations } from '../actions/db/locations'
import { getAllSessions, getCurrentUserRsvps } from '../actions/db/sessions'
import Schedule from './Schedule'
import { getUserEditPermissionsForSessions } from './actions'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'

import { createClient } from '@/utils/supabase/server'

import { currentUserGetSessionBookmarks } from '@/app/actions/db/sessionBookmarks'
// import { fetchSessions, fetchCurrentUserRsvps, fetchLocations } from "./queries"
import { SessionResponse } from '@/app/api/queries/sessions/schema'

export default async function ScheduleProvider({
  sessionId,
  dayIndex,
}: {
  sessionId?: string
  dayIndex?: number
}) {
  const queryClient = new QueryClient()

  // Prefetch all the data server-side
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['sessions'],
      queryFn: getAllSessions,
    }),
    queryClient.prefetchQuery({
      queryKey: ['rsvps', 'current-user'],
      queryFn: getCurrentUserRsvps,
    }),
    queryClient.prefetchQuery({
      queryKey: ['locations'],
      queryFn: getAllLocations,
    }),
    queryClient.prefetchQuery({
      queryKey: ['bookmarks', 'current-user'],
      queryFn: currentUserGetSessionBookmarks,
    }),
  ])

  // Get current user for edit permissions
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch edit permissions if user is logged in
  let editPermissions: Record<string, boolean> = {}
  if (user?.id) {
    // Get sessions from the prefetched data
    const sessions = queryClient.getQueryData(['sessions']) as
      | SessionResponse[]
      | undefined
    if (sessions) {
      editPermissions = await getUserEditPermissionsForSessions({
        userId: user.id,
        sessionIds: sessions.map((s) => s.id).filter(Boolean) as string[],
      })
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Schedule
        sessionId={sessionId}
        dayIndex={dayIndex}
        editPermissions={editPermissions}
      />
    </HydrationBoundary>
  )
}
