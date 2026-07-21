import { redirect } from 'next/navigation'

import {
  getCurrentUser,
  getUserPublicProfileById,
} from '@/app/actions/db/users'

import { DbPublicProfile } from '@/types/database/dbTypeAliases'

export type AuthLevel = 'ADMIN' | 'GREEN' | 'VOLUNTEER' | 'NONE'
export const authLevelsToRanks: Record<AuthLevel, number> = {
  ADMIN: 3,
  GREEN: 2,
  VOLUNTEER: 1,
  NONE: 0,
}
export const profileAuthLevel = (
  userProfile: DbPublicProfile | null | undefined,
): AuthLevel => {
  if (!userProfile) return 'NONE'
  if (userProfile.is_admin) return 'ADMIN'
  if (userProfile.team === 'green') return 'GREEN'
  if (userProfile.volunteer) return 'VOLUNTEER'
  return 'NONE'
}
export const profileAuthRank = (
  userProfile: DbPublicProfile | null | undefined,
): number => {
  if (!userProfile) return 0
  return authLevelsToRanks[profileAuthLevel(userProfile)]
}
/** Async auth level by lookup of a user id */
export const getUserAuthLevelById = async (
  userId: string,
): Promise<AuthLevel> => {
  const userProfile = await getUserPublicProfileById({ userId })
  return profileAuthLevel(userProfile)
}
/** Async lookup for current user's auth level with supabase */
export const getCurrentUserAuthLevel = async (): Promise<AuthLevel> => {
  const user = await getCurrentUser()
  if (!user) return 'NONE'
  return getUserAuthLevelById(user.id)
}
export const getCurrentUserAuthRank = async (): Promise<number> => {
  return authLevelsToRanks[await getCurrentUserAuthLevel()]
}
/** Throws unless the current user has >= the specified auth level.
 *
 * Throw-on-fail rather than boolean-returning on purpose: an un-awaited async
 * predicate is a truthy Promise, so `if (!hasAuthLevel(...))` silently passes. */
export const assertAuthLevel = async ({
  authLevel = 'ADMIN',
  message = 'Unauthorized',
}: { authLevel?: AuthLevel; message?: string } = {}) => {
  if ((await getCurrentUserAuthRank()) < authLevelsToRanks[authLevel]) {
    throw new Error(message)
  }
}
/** Whether the provided user profile has >= the specified auth rank number */
export const profileHasAuthRank = ({
  profile,
  authRank = 3,
}: {
  profile: DbPublicProfile | null | undefined
  authRank?: number
}) => {
  if (!profile) return false
  return profileAuthRank(profile) >= authRank
}
/** Whether the provided user profile has auth level at or above specified */
export const profileHasAuthLevel = ({
  profile,
  authLevel = 'ADMIN',
}: {
  profile: DbPublicProfile | null | undefined
  authLevel?: AuthLevel
}) => {
  if (!profile) return false
  return profileAuthRank(profile) >= authLevelsToRanks[authLevel]
}
export const redirectIfNotAuthed = async ({
  authLevel = 'ADMIN',
  redirectTo = '/not-authorized',
}: { authLevel?: AuthLevel; redirectTo?: string } = {}) => {
  const currentUserAuthRank = await getCurrentUserAuthRank()
  const requiredAuthRank = authLevelsToRanks[authLevel]
  const authed = currentUserAuthRank >= requiredAuthRank

  if (!authed) {
    redirect(redirectTo)
  }
}
