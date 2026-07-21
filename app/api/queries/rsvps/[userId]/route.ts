import { NextRequest, NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

import { getUserRsvps } from '@/app/actions/db/sessionRsvps'

import { DbSessionRsvp } from '@/types/database/dbTypeAliases'

export type ApiUserRsvpsResponse = DbSessionRsvp[]

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params

    const rsvps = await getUserRsvps({ userId })

    return NextResponse.json(rsvps satisfies ApiUserRsvpsResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch RSVPs')
  }
}
