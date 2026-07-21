import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

import { getUserPublicProfileById } from '@/app/actions/db/users'

import { DbPublicProfile } from '@/types/database/dbTypeAliases'

export type ApiUserPublicProfileResponse = DbPublicProfile | null
export async function GET(
  _request: Request,
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
    return apiError(error, 'Failed to fetch profile')
  }
}
