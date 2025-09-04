import { NextResponse } from 'next/server'

import { getAllUserPublicProfiles } from '@/app/actions/db/users'

import { DbPublicProfile } from '@/types/database/dbTypeAliases'

export type ApiPublicProfilesResponse = DbPublicProfile[]
export async function GET() {
  try {
    const profiles = await getAllUserPublicProfiles()

    return NextResponse.json(profiles satisfies ApiPublicProfilesResponse)
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
