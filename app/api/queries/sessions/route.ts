import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

import { sessionWithoutAttendees } from '@/utils/dbUtils'

import { getAllSessions } from '@/app/actions/db/sessions'
import { getApiUser } from '@/app/api/apiAuth'

import { DbFullSession } from '@/types/database/dbTypeAliases'

export type ApiAllSessionsResponse = DbFullSession[]
export async function GET() {
  try {
    // The schedule itself is public; who is going to each session is not
    const user = await getApiUser()

    const sessions = await getAllSessions()
    const visibleSessions = user
      ? sessions
      : sessions.map(sessionWithoutAttendees)

    return NextResponse.json(visibleSessions satisfies ApiAllSessionsResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch sessions')
  }
}
