import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'
import { sessionRsvpsService } from '@/lib/db/sessionRsvps'

import { getApiUser, unauthorizedResponse } from '@/app/api/apiAuth'

import { DbFullSessionRsvp } from '@/types/database/dbTypeAliases'

export type ApiRsvpsResponse = DbFullSessionRsvp[]
export async function GET() {
  try {
    // Names every attendee of every session, so attendees only
    const user = await getApiUser()
    if (!user) return unauthorizedResponse()

    const rsvps = await sessionRsvpsService.getAllRsvps()

    return NextResponse.json(rsvps satisfies ApiRsvpsResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch RSVPs')
  }
}
