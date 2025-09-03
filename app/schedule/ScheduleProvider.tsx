import { getAllLocations } from '../actions/db/locations'
import { getAllSessions } from '../actions/db/sessions'
import { getCurrentUserFullProfile } from '../actions/db/users'
import Schedule from './Schedule'
import { getUserEditPermissionsForSessions } from './actions'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'

import { createClient } from '@/utils/supabase/server'

import { currentUserGetSessionBookmarks } from '@/app/actions/db/sessionBookmarks'

import { DbFullSession } from '@/types/database/dbTypeAliases'

// import { fetchSessions, fetchCurrentUserRsvps, fetchLocations } from "./queries"

export default async function ScheduleProvider({
  sessionId,
  dayIndex,
}: {
  sessionId?: string
  dayIndex?: number
}) {
  const queryClient = new QueryClient()
  // Get current user for edit permissions
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Prefetch all the data server-side
  const userPrefetchQueries = [
    () =>
      queryClient.prefetchQuery({
        queryKey: ['users', 'profile', 'current-user'],
        queryFn: () => getCurrentUserFullProfile(),
      }),
    () =>
      queryClient.prefetchQuery({
        queryKey: ['bookmarks', 'current-user'],
        queryFn: currentUserGetSessionBookmarks,
      }),
  ]
  const generalPrefetchQueries = [
    () =>
      queryClient.prefetchQuery({
        queryKey: ['sessions'],
        queryFn: getAllSessions,
      }),
    () =>
      queryClient.prefetchQuery({
        queryKey: ['locations'],
        queryFn: getAllLocations,
      }),
  ]
  await Promise.all(generalPrefetchQueries.map((query) => query()))
  if (user?.id) {
    await Promise.all(userPrefetchQueries.map((query) => query()))
  }

  // Fetch edit permissions if user is logged in
  let editPermissions: Record<string, boolean> = {}
  if (user?.id) {
    // Get sessions from the prefetched data
    const sessions = queryClient.getQueryData<DbFullSession[]>(['sessions'])
    if (sessions) {
      editPermissions = await getUserEditPermissionsForSessions({
        userId: user.id,
        sessionIds: sessions.map((s) => s.id),
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
