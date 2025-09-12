import { NextResponse } from 'next/server'

import { getUserPublicProfileById } from '@/app/actions/db/users'

import { DbPublicProfile } from '@/types/database/dbTypeAliases'

export type ApiUserPublicProfileResponse = DbPublicProfile | null
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params

    const profile = await getUserPublicProfileById({ userId })

    const response = NextResponse.json(
      profile satisfies ApiUserPublicProfileResponse,
    )

    // Add cache headers - profiles don't change often
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=86400',
    )

    return response
  } catch (error) {
    console.error('Error fetching user profile:', error)

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
