//prefetch data for layout provider
import { QueryClient, dehydrate } from '@tanstack/react-query'

import {
  getCurrentUser,
  getCurrentUserFullProfile,
} from '@/app/actions/db/users'

/**
 * Prefetches the user and (conditionally) the user's profile into a temporary
 * QueryClient, then returns a dehydrated snapshot for client hydration.
 */
export async function prefetchState() {
  const qc = new QueryClient()
  const currentUser = await getCurrentUser()
  const prefetches = [
    async () =>
      qc.prefetchQuery({
        queryKey: ['users', 'current'],
        queryFn: () => currentUser,
      }),
    async () =>
      qc.prefetchQuery({
        queryKey: ['users', 'profile', currentUser?.id ?? null],
        queryFn: getCurrentUserFullProfile,
      }),
  ]
  await Promise.all(prefetches.map((prefetch) => prefetch()))

  return dehydrate(qc)
}
