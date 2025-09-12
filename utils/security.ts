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
export const getUserAuthLevelFromProfile = async (
  userProfile: DbPublicProfile,
): Promise<AuthLevel> => {
  if (userProfile.is_admin) return 'ADMIN'
  if (userProfile.team === 'green') return 'GREEN'
  if (userProfile.volunteer) return 'VOLUNTEER'
  return 'NONE'
}
export const getUserAuthLevelById = async (
  userId: string,
): Promise<AuthLevel> => {
  const userProfile = await getUserPublicProfileById({ userId })
  if (!userProfile) return 'NONE'
  return getUserAuthLevelFromProfile(userProfile)
}
export const getCurrentUserAuthLevel = async (): Promise<AuthLevel> => {
  const user = await getCurrentUser()
  if (!user) return 'NONE'
  return getUserAuthLevelById(user.id)
}
export const getCurrentUserAuthRank = async (): Promise<number> => {
  return authLevelsToRanks[await getCurrentUserAuthLevel()]
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
