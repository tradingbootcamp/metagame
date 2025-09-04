import { NextResponse } from 'next/server'

import { getSessionById } from '@/app/actions/db/sessions'

import { DbFullSession } from '@/types/database/dbTypeAliases'

export type ApiSessionResponse = DbFullSession | null
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionById({ sessionId: (await params).id })

    return NextResponse.json(session satisfies ApiSessionResponse)
  } catch (error) {
    console.error('Error fetching session:', error)

    // Return more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to fetch session',
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
