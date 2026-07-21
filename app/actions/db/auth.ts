import { usersService } from '@/lib/db/users'

/** Wraps a function and returns a version that only runs if the current user is an admin
 *
 * for exporting potentially sensitive server functions we don't want arbitrary users to be able to run*/

export const adminExportWrapper = <Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R> | R,
) => {
  return async (...args: Args): Promise<R> => {
    const user = await usersService.getCurrentUser()
    if (!user || !user.id)
      throw new Error('No current user found in admin function wrapper')
    const userId = user.id
    if (!(await usersService.getUserAdminStatus({ userId }))) {
      throw new Error('Unauthorized user found in admin function wrapper')
    }
    return await fn(...args)
  }
}

/** Wraps a function and returns a version that only runs for a signed-in user
 * (any auth level). For exports whose data is attendees-only but not scoped to
 * the caller. */
export const authedExportWrapper = <Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R> | R,
) => {
  return async (...args: Args): Promise<R> => {
    const user = await usersService.getCurrentUser()
    if (!user || !user.id)
      throw new Error('No current user found in authed function wrapper')
    return await fn(...args)
  }
}

/** Wraps a function that takes a userId (in an object), and returns a function that takes all its other arguments and injects the current user's id from the supabase session. For wrapping functions to export in a way that only lets clients use on themselves */
export const currentUserWrapper = <
  P extends Record<string, unknown> & { userId: string },
  R,
>(
  fn: (params: P) => Promise<R> | R,
) => {
  return async (params: Omit<P, 'userId'>): Promise<R> => {
    const user = await usersService.getCurrentUser()
    if (!user || !user.id) throw new Error('No current user found')

    // Spread caller-supplied props + our injected userId
    return fn({ ...params, userId: user.id } as P)
  }
}
