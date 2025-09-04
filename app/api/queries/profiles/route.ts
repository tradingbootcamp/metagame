import { NextResponse } from 'next/server'

import { adminGetAllFullProfiles } from '@/app/actions/db/users'

import { DbFullProfile } from '@/types/database/dbTypeAliases'

export type ApiFullProfilesResponse = DbFullProfile[]
export async function GET() {
  try {
    const profiles = await adminGetAllFullProfiles()

    return NextResponse.json(profiles satisfies ApiFullProfilesResponse)
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
