'use server'

import z from 'zod'

import { sessionsService } from '@/lib/db/sessions'
import { usersService } from '@/lib/db/users'

import { SESSION_AGES } from '@/utils/dbUtils'
import { createClient } from '@/utils/supabase/server'

import { DbSession, DbSessionUpdate } from '@/types/database/dbTypeAliases'

export async function userCanEditSession({
  userId,
  sessionId,
}: {
  userId: string
  sessionId: string
}) {
  //Admins can edit any session
  if (await usersService.getUserAdminStatus({ userId })) {
    return true
  }

  const session = await sessionsService.getSessionById({ sessionId })
  if (!session) {
    return false
  }
  //Hosts can edit sessions
  if (
    [session.host_1_id, session.host_2_id, session.host_3_id].includes(userId)
  ) {
    return true
  }

  return false
}

// Fields that users can update on sessions; for admins editing sessinos more generally, we use adminUpdateSession
const sessionUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  min_capacity: z.number().min(1).optional(),
  max_capacity: z.number().min(1).optional(),
  ages: z.enum(SESSION_AGES).optional(),
})
export async function userEditSession({
  sessionId,
  sessionUpdate,
}: {
  sessionId: DbSession['id']
  sessionUpdate: DbSessionUpdate
}) {
  const supabase = await createClient()
  const {
    data: { user: currentUser },
    error: currentUserError,
  } = await supabase.auth.getUser()
  if (currentUserError || !currentUser) {
    throw new Error('User not authenticated')
  }

  // Check permissions using the efficient method
  const permissions = await getUserEditPermissionsForSessions({
    userId: currentUser.id,
    sessionIds: [sessionId],
  })

  if (!permissions[sessionId]) {
    throw new Error('Unauthorized')
  }

  //extract only the values that a user can edit
  const validatedSessionUpdate = sessionUpdateSchema.parse(sessionUpdate)
  await sessionsService.updateSession({
    sessionId,
    payload: validatedSessionUpdate,
  })
}

export async function getUserEditPermissionsForSessions({
  userId,
  sessionIds,
}: {
  userId: string
  sessionIds: string[]
}) {
  // If no sessions, return empty object
  if (!sessionIds.length) return {}

  // Check if user is admin first
  const userIsAdmin = await usersService.getUserAdminStatus({ userId })
  if (userIsAdmin) {
    // Admin can edit all sessions
    return sessionIds.reduce(
      (acc, sessionId) => {
        acc[sessionId] = true
        return acc
      },
      {} as Record<string, boolean>,
    )
  }

  // For non-admins, get all sessions they host
  const hostedSessions = await sessionsService.getSessionsHostedByUser({
    userId,
  })
  const hostedSessionIds = new Set(hostedSessions.map((session) => session.id))

  // Create permissions object
  const permissions: Record<string, boolean> = {}
  for (const sessionId of sessionIds) {
    permissions[sessionId] = hostedSessionIds.has(sessionId)
  }

  return permissions
}
