import { NextResponse } from 'next/server'

import { getAllRsvps } from '@/app/actions/db/sessionRsvps'

import { DbFullSessionRsvp } from '@/types/database/dbTypeAliases'

export type ApiRsvpsResponse = DbFullSessionRsvp[]
export async function GET() {
  try {
    const rsvps = await getAllRsvps()

    return NextResponse.json(rsvps satisfies ApiRsvpsResponse)
  } catch (error) {
    console.error('Error fetching RSVPs:', error)

    // Return more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to fetch RSVPs',
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
