import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

import { getAllRsvps } from '@/app/actions/db/sessionRsvps'

import { DbFullSessionRsvp } from '@/types/database/dbTypeAliases'

export type ApiRsvpsResponse = DbFullSessionRsvp[]
export async function GET() {
  try {
    const rsvps = await getAllRsvps()

    return NextResponse.json(rsvps satisfies ApiRsvpsResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch RSVPs')
  }
}
