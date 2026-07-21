import { NextRequest, NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'
import { usersService } from '@/lib/db/users'
import { stripPrivateProfileFields } from '@/lib/profiles'

import { getApiUser, unauthorizedResponse } from '@/app/api/apiAuth'

import { DbPublicProfile } from '@/types/database/dbTypeAliases'

export type ApiAllPublicProfilesResponse = DbPublicProfile[]
export async function GET() {
  try {
    // The whole attendee roster is attendees-only
    const user = await getApiUser()
    if (!user) return unauthorizedResponse()

    const profiles = await usersService.getAllUserPublicProfiles()

    const response = NextResponse.json(
      profiles satisfies ApiAllPublicProfilesResponse,
    )

    response.headers.set('Cache-Control', 'private, no-store')

    return response
  } catch (error) {
    return apiError(error, 'Failed to fetch profiles')
  }
}

export type ApiUsersPublicProfilesResponse = DbPublicProfile[]
export async function POST(request: NextRequest) {
  try {
    // Anonymous callers get these (speaker and team card grids), minus the
    // fields only attendees may see
    const user = await getApiUser()

    const { userIds } = (await request.json()) as { userIds: string[] }
    const profiles = await usersService.getUsersPublicProfiles({ userIds })
    const visibleProfiles = user
      ? profiles
      : profiles.map(stripPrivateProfileFields)

    const response = NextResponse.json(
      visibleProfiles satisfies ApiUsersPublicProfilesResponse,
    )

    // Varies by session, so it can't sit in a shared cache
    response.headers.set('Cache-Control', 'private, no-store')

    return response
  } catch (error) {
    return apiError(error, 'Failed to fetch profiles')
  }
}
