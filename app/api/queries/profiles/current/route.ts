import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

import { getCurrentUserFullProfile } from '@/app/actions/db/users'

import { DbFullProfile } from '@/types/database/dbTypeAliases'

export type ApiCurrentUserFullProfileResponse = DbFullProfile | null

export async function GET() {
  try {
    const profile = await getCurrentUserFullProfile()

    return NextResponse.json(
      profile satisfies ApiCurrentUserFullProfileResponse,
    )
  } catch (error) {
    return apiError(error, 'Failed to fetch profile')
  }
}
