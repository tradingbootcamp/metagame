//prefetch data for layout provider
import { QueryClient, dehydrate } from '@tanstack/react-query'

import { usersService } from '@/lib/db/users'

/**
 * Seeds the current user and (when signed in) their profile into a temporary
 * QueryClient, then returns a dehydrated snapshot for client hydration.
 *
 * Server-only: pulls from lib/db directly rather than the action wrappers,
 * because we have already established the user's identity here and the
 * wrappers would re-run supabase.auth.getUser() to inject the same id.
 */
export async function prefetchState() {
  const qc = new QueryClient()
  const currentUser = await usersService.getCurrentUser()
  qc.setQueryData(['users', 'current'], currentUser)

  // Anonymous visitors have no profile to fetch. This used to run
  // unconditionally via getCurrentUserFullProfile(), which re-authenticated and
  // then threw for signed-out users — a wasted round trip on every marketing
  // page load. The client's useUser() is likewise `enabled: !!currentUser?.id`.
  if (currentUser?.id) {
    try {
      qc.setQueryData(
        ['users', 'profile', currentUser.id],
        await usersService.getUserFullProfile({ userId: currentUser.id }),
      )
    } catch (error) {
      // prefetchQuery used to swallow this. Keep a profile read failure from
      // taking down every route; the client query will retry.
      console.error('prefetchState: could not prefetch user profile', error)
    }
  }

  return dehydrate(qc)
}
