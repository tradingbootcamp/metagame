'use server'

import { adminExportWrapper, currentUserWrapper } from './auth'

import { sessionRsvpsService } from '@/lib/db/sessionRsvps'

import { currentUserHasAuthLevel } from '@/utils/security'

export const getAllRsvps = sessionRsvpsService.getAllRsvps

export const getUserRsvps = sessionRsvpsService.getUserRsvps

export const getAllSessionRsvpCounts =
  sessionRsvpsService.getAllSessionRsvpCounts
export const getSingleSessionRsvps = sessionRsvpsService.getSingleSessionRsvps
export const getCurrentUserRsvps = async () => {
  try {
    return await currentUserWrapper(sessionRsvpsService.getUserRsvps)({})
  } catch {
    return []
  }
}
/** Mutations */
export const rsvpCurrentUserToSession = currentUserWrapper(
  sessionRsvpsService.rsvpUserToSession,
)
export const unrsvpCurrentUserFromSession = currentUserWrapper(
  sessionRsvpsService.unrsvpUserFromSession,
)
export const toggleCurrentUserSessionRsvp = currentUserWrapper(
  sessionRsvpsService.toggleUserRsvpForSession,
)
export const unrsvpCurrentUserFromAllSessions = currentUserWrapper(
  sessionRsvpsService.unrsvpUserFromAllSessions,
)
export const greenUnRsvpUserFromSession = async ({
  sessionId,
  userId,
}: {
  sessionId: string
  userId: string
}) => {
  if (!currentUserHasAuthLevel({ authLevel: 'GREEN' })) {
    throw new Error('Unauthorized user trying to un-RSVP a user')
  }
  return sessionRsvpsService.unrsvpUserFromSession({ sessionId, userId })
}
export const adminRsvpUserToSession = adminExportWrapper(
  sessionRsvpsService.rsvpUserToSession,
)

export const repairSessionWaitlists = adminExportWrapper(
  sessionRsvpsService.repairSessionWaitlists,
)
