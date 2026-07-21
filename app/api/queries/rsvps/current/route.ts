import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

import { getCurrentUserRsvps } from '@/app/actions/db/sessionRsvps'

import { DbSessionRsvp } from '@/types/database/dbTypeAliases'

export type ApiCurrentUserRsvpsResponse = DbSessionRsvp[]
export async function GET() {
  try {
    const rsvps = await getCurrentUserRsvps()

    return NextResponse.json(rsvps satisfies ApiCurrentUserRsvpsResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch RSVPs')
  }
}
