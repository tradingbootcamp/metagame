import { NextRequest, NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'
import { sessionRsvpsService } from '@/lib/db/sessionRsvps'

import { getApiUser, unauthorizedResponse } from '@/app/api/apiAuth'

import { DbSessionRsvp } from '@/types/database/dbTypeAliases'

export type ApiUserRsvpsResponse = DbSessionRsvp[]

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    // Another attendee's schedule, so attendees only
    const user = await getApiUser()
    if (!user) return unauthorizedResponse()

    const { userId } = await params

    const rsvps = await sessionRsvpsService.getUserRsvps({ userId })

    return NextResponse.json(rsvps satisfies ApiUserRsvpsResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch RSVPs')
  }
}
