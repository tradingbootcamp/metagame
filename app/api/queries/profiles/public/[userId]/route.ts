import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'
import { usersService } from '@/lib/db/users'
import { stripPrivateProfileFields } from '@/lib/profiles'

import { getApiUser } from '@/app/api/apiAuth'

import { DbPublicProfile } from '@/types/database/dbTypeAliases'

export type ApiUserPublicProfileResponse = DbPublicProfile | null
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    // Anonymous callers get the card-facing profile, minus the fields only
    // attendees may see
    const user = await getApiUser()

    const { userId } = await params

    const profile = await usersService.getUserPublicProfileById({ userId })
    const visibleProfile =
      profile && !user ? stripPrivateProfileFields(profile) : profile

    const response = NextResponse.json(
      visibleProfile satisfies ApiUserPublicProfileResponse,
    )

    // Varies by session, so it can't sit in a shared cache
    response.headers.set('Cache-Control', 'private, no-store')

    return response
  } catch (error) {
    return apiError(error, 'Failed to fetch profile')
  }
}
