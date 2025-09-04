import { getCurrentUser, getCurrentUserFullProfile } from '../actions/db/users'
import PlayerCard from './PlayerCard'
import Profile from './Profile'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'

import { createClient } from '@/utils/supabase/server'

export default async function ProfileProvider() {
  const queryClient = new QueryClient()

  // Get current user first
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.id) {
    // Prefetch user data server-side
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['users', 'current'],
        queryFn: getCurrentUser,
      }),
      queryClient.prefetchQuery({
        queryKey: ['users', 'profile', user.id],
        queryFn: () => getCurrentUserFullProfile(),
      }),
    ])
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col items-center gap-4">
        <Profile />
        {user && <PlayerCard userId={user.id} />}
      </div>
    </HydrationBoundary>
  )
}
