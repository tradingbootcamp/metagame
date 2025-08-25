'use server'

import { adminExportWrapper, currentUserWrapper } from './auth'

import { sessionsService } from '@/lib/db/sessions'

import { DbSessionRsvpWithTeam } from '@/types/database/dbTypeAliases'

export const adminGetAllRsvps: () => Promise<DbSessionRsvpWithTeam[]> =
  adminExportWrapper(sessionsService.getAllRsvps)

export const adminGetUserRsvps = adminExportWrapper(
  sessionsService.getUserRsvps,
)
export const getAllSessionRsvpCounts = sessionsService.getAllSessionRsvpCounts
export const getSingleSessionRsvps = sessionsService.getSingleSessionRsvps
export const getCurrentUserRsvps = async () => {
  try {
    return await currentUserWrapper(sessionsService.getUserRsvps)({})
  } catch {
    return []
  }
}
/** Mutations */
export const rsvpCurrentUserToSession = currentUserWrapper(
  sessionsService.rsvpUserToSession,
)
export const unrsvpCurrentUserFromSession = currentUserWrapper(
  sessionsService.unrsvpUserFromSession,
)
export const toggleCurrentUserSessionRsvp = currentUserWrapper(
  sessionsService.toggleUserRsvpForSession,
)
export const unrsvpCurrentUserFromAllSessions = currentUserWrapper(
  sessionsService.unrsvpUserFromAllSessions,
)
