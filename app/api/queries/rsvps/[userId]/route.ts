import { NextResponse } from 'next/server'

import { getUserRsvps } from '@/app/actions/db/sessionRsvps'

import { DbSessionRsvp } from '@/types/database/dbTypeAliases'

export type ApiUserRsvpsResponse = DbSessionRsvp[]

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params

    const rsvps = await getUserRsvps({ userId })

    return NextResponse.json(rsvps satisfies ApiUserRsvpsResponse)
  } catch (error) {
    console.error('Error fetching user RSVPs:', error)

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
