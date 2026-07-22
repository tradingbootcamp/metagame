'use server'

import z from 'zod'

import { sessionsService } from '@/lib/db/sessions'
import { usersService } from '@/lib/db/users'

import { SESSION_AGES, SESSION_CATEGORIES } from '@/utils/dbUtils'
import { createClient } from '@/utils/supabase/server'

import { DbSession, DbSessionUpdate } from '@/types/database/dbTypeAliases'

async function requireCurrentUserId() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('User not authenticated')
  }
  return user.id
}

/** Deliberately not exported: every export of a `'use server'` module is a
 * POST-callable endpoint, so anything taking a caller-supplied userId has to
 * stay private and be reached through a wrapper that derives the id from the
 * session. */
async function editPermissionsForUser({
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

// Fields that users can update on sessions; for admins editing sessinos more generally, we use adminUpdateSession
const sessionUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  needs: z.string().optional().nullable(),
  // nullish, not optional: the edit modal sends explicit nulls for unset capacities
  min_capacity: z.number().min(1).nullish(),
  max_capacity: z.number().min(1).nullish(),
  ages: z.enum(SESSION_AGES).optional(),
  category: z.enum(SESSION_CATEGORIES).nullish(),
})
export async function userEditSession({
  sessionId,
  sessionUpdate,
}: {
  sessionId: DbSession['id']
  sessionUpdate: DbSessionUpdate
}) {
  const userId = await requireCurrentUserId()

  // Check permissions using the efficient method
  const permissions = await editPermissionsForUser({
    userId,
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

/** Edit permissions for the signed-in caller; throws when there's no session. */
export async function getUserEditPermissionsForSessions({
  sessionIds,
}: {
  sessionIds: string[]
}) {
  const userId = await requireCurrentUserId()
  return editPermissionsForUser({ userId, sessionIds })
}
