//prefetch data for layout provider
import { QueryClient, dehydrate } from '@tanstack/react-query'

import { getCurrentUser, getCurrentUserProfile } from '@/app/actions/db/users'

/**
 * Prefetches the user and (conditionally) the user's profile into a temporary
 * QueryClient, then returns a dehydrated snapshot for client hydration.
 */
export async function prefetchState() {
  const qc = new QueryClient()

  const prefetches = [
    async () =>
      qc.prefetchQuery({
        queryKey: ['users', 'current'],
        queryFn: getCurrentUser,
      }),
    async () =>
      qc.prefetchQuery({
        queryKey: ['users', 'profile', 'current-user'],
        queryFn: getCurrentUserProfile,
      }),
  ]
  await Promise.all(prefetches.map((prefetch) => prefetch()))

  return dehydrate(qc)
}
