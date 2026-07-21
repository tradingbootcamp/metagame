import { NextRequest, NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

import {
  adminGetAllFullProfiles,
  adminGetUsersFullProfiles,
} from '@/app/actions/db/users'

import { DbFullProfile } from '@/types/database/dbTypeAliases'

export type ApiAllFullProfilesResponse = DbFullProfile[]
export async function GET() {
  try {
    const profiles = await adminGetAllFullProfiles()

    return NextResponse.json(profiles satisfies ApiAllFullProfilesResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch profiles')
  }
}

export type ApiUsersFullProfilesResponse = DbFullProfile[]
export async function POST(request: NextRequest) {
  try {
    const { userIds } = (await request.json()) as { userIds: string[] }
    const profiles = await adminGetUsersFullProfiles({ userIds })

    return NextResponse.json(profiles satisfies ApiUsersFullProfilesResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch profiles')
  }
}
