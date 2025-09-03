import { NextResponse } from 'next/server'

import { getCurrentUserFullProfile } from '@/app/actions/db/users'

export async function GET() {
  try {
    const profile = await getCurrentUserFullProfile()

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching current user profile:', error)

    // Return more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to fetch profile',
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
