import { getAllLocations } from '../actions/db/locations'
import { adminGetAllRsvps } from '../actions/db/sessionRsvps'
import { getAllSessions } from '../actions/db/sessions'
import Schedule from './Schedule'
import { getUserEditPermissionsForSessions } from './actions'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'

import { createClient } from '@/utils/supabase/server'

import { currentUserGetSessionBookmarks } from '@/app/actions/db/sessionBookmarks'

import { DbSessionView } from '@/types/database/dbTypeAliases'

// import { fetchSessions, fetchCurrentUserRsvps, fetchLocations } from "./queries"

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
      queryKey: ['locations'],
      queryFn: getAllLocations,
    }),
    queryClient.prefetchQuery({
      queryKey: ['bookmarks', 'current-user'],
      queryFn: currentUserGetSessionBookmarks,
    }),
    queryClient.prefetchQuery({
      queryKey: ['rsvps', 'all'],
      queryFn: adminGetAllRsvps,
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
      | DbSessionView[]
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
