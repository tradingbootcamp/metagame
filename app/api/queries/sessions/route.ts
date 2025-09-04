import { NextResponse } from 'next/server'

import { getAllSessions } from '@/app/actions/db/sessions'

import { DbFullSession } from '@/types/database/dbTypeAliases'

export type ApiAllSessionsResponse = DbFullSession[]
export async function GET() {
  try {
    const sessions = await getAllSessions()

    return NextResponse.json(sessions satisfies ApiAllSessionsResponse)
  } catch (error) {
    console.error('Error fetching sessions:', error)

    // Return more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to fetch sessions',
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
