'use server'

import { adminExportWrapper, currentUserWrapper } from './auth'

import { sessionsService } from '@/lib/db/sessions'

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

export const getCurrentUserHostedSessions = currentUserWrapper(
  sessionsService.getSessionsHostedByUser,
)
