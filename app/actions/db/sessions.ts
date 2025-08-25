'use server'

import { adminExportWrapper, currentUserWrapper } from './auth'

import { sessionsService } from '@/lib/db/sessions'

/* Mutations */
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

export const adminAddSession = adminExportWrapper(sessionsService.addSession)
export const adminUpdateSession = adminExportWrapper(
  sessionsService.updateSession,
)
export const adminDeleteSession = adminExportWrapper(
  sessionsService.deleteSession,
)

/* Queries */
export const getAllSessions = sessionsService.getAllSessions
export const getSessionById = sessionsService.getSessionById
export const getAllSessionRsvpCounts = sessionsService.getAllSessionRsvpCounts
export const getSingleSessionRsvps = sessionsService.getSingleSessionRsvps
export const getCurrentUserRsvps = async () => {
  try {
    return await currentUserWrapper(sessionsService.getUserRsvps)({})
  } catch {
    return []
  }
}
export const getCurrentUserHostedSessions = currentUserWrapper(
  sessionsService.getUsersHostedSessions,
)

export const adminGetAllRsvps = adminExportWrapper(sessionsService.getAllRsvps)

export const adminGetUserRsvps = adminExportWrapper(
  sessionsService.getUserRsvps,
)
