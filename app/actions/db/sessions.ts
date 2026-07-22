'use server'

import { adminExportWrapper, currentUserWrapper } from './auth'

import { playerCardClaimsService } from '@/lib/db/playerCardClaims'
import { sessionsService } from '@/lib/db/sessions'
import { usersService } from '@/lib/db/users'

import { authLevelsToRanks, getCurrentUserAuthRank } from '@/utils/security'

import { DbTeamColor } from '@/types/database/dbTypeAliases'

export const adminAddSession = adminExportWrapper(sessionsService.addSession)
export const adminUpdateSession = adminExportWrapper(
  sessionsService.updateSession,
)
export const adminDeleteSession = adminExportWrapper(
  sessionsService.deleteSession,
)

export const authedDeclareWinningTeam = async ({
  sessionId,
  winningTeam,
}: {
  sessionId: string
  winningTeam: Extract<DbTeamColor, 'orange' | 'purple'>
}) => {
  const session = await sessionsService.getSessionById({ sessionId })
  if (!session) {
    throw new Error('Session not found')
  }
  const currentUserId = (await usersService.getCurrentUser())?.id
  if (!currentUserId) {
    throw new Error('No current user found')
  }
  let authed = false
  if ((await getCurrentUserAuthRank()) >= authLevelsToRanks.GREEN) {
    authed = true
  } else {
    const sessionHosts = await sessionsService.getSessionHosts({ sessionId })
    if (sessionHosts.includes(currentUserId)) {
      authed = true
    }
  }
  if (!authed) {
    throw new Error('You are not authorized to declare the winning team')
  }
  const declaredSession = await sessionsService.declareWinningTeam({
    sessionId,
    winningTeam,
  })
  if (!declaredSession) {
    throw new Error('A winning team has already been declared for this session')
  }
  const winnerUserIds = session.rsvps
    .filter((rsvp) => !rsvp.on_waitlist && rsvp.user?.team === winningTeam)
    .map((rsvp) => rsvp.user_id)
  if (winnerUserIds.length > 0) {
    await playerCardClaimsService.createOpenPlayerCardClaims({
      userIds: winnerUserIds,
      sessionId,
    })
  }
}

/* Queries */
export const getCurrentUserHostedSessions = currentUserWrapper(
  sessionsService.getSessionsHostedByUser,
)
