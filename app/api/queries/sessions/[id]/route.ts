import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'
import { sessionsService } from '@/lib/db/sessions'

import { sessionWithoutAttendees } from '@/utils/dbUtils'

import { getApiUser } from '@/app/api/apiAuth'

import { DbFullSession } from '@/types/database/dbTypeAliases'

export type ApiSessionResponse = DbFullSession | null
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // The session itself is public; who is going to it is not
    const user = await getApiUser()

    const session = await sessionsService.getSessionById({
      sessionId: (await params).id,
    })
    const visibleSession =
      session && !user ? sessionWithoutAttendees(session) : session

    return NextResponse.json(visibleSession satisfies ApiSessionResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch session')
  }
}
