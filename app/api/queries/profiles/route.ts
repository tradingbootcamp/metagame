import { NextResponse } from 'next/server'

import { adminGetAllProfiles } from '@/app/actions/db/users'

export async function GET() {
  try {
    const profiles = await adminGetAllProfiles()

    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Error fetching profiles:', error)

    // Return more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to fetch profiles',
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
