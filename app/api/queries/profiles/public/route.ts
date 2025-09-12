import { NextRequest, NextResponse } from 'next/server'

import {
  getAllUserPublicProfiles,
  getUsersPublicProfiles,
} from '@/app/actions/db/users'

import { DbPublicProfile } from '@/types/database/dbTypeAliases'

export type ApiAllPublicProfilesResponse = DbPublicProfile[]
export async function GET() {
  try {
    const profiles = await getAllUserPublicProfiles()

    const response = NextResponse.json(
      profiles satisfies ApiAllPublicProfilesResponse,
    )

    // Add cache headers - profiles don't change often
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=86400',
    )

    return response
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

export type ApiUsersPublicProfilesResponse = DbPublicProfile[]
export async function POST(request: NextRequest) {
  try {
    const { userIds } = (await request.json()) as { userIds: string[] }
    const profiles = await getUsersPublicProfiles({ userIds })

    const response = NextResponse.json(
      profiles satisfies ApiUsersPublicProfilesResponse,
    )

    // Add cache headers - profiles don't change often
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=86400',
    )

    return response
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
