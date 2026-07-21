import { NextRequest, NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

import { createClient } from '@/utils/supabase/server'

import {
  adminGetUserFullProfileById,
  getCurrentUserFullProfile,
} from '@/app/actions/db/users'

import { DbFullProfile } from '@/types/database/dbTypeAliases'

export type ApiUserFullProfileResponse = DbFullProfile | null

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params

    // Get current user from server client
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let profile

    // If requesting their own data, allow it using current user wrapper
    if (userId === user.id) {
      profile = await getCurrentUserFullProfile()
    } else {
      // Otherwise, require admin privileges
      profile = await adminGetUserFullProfileById({ userId })
    }

    return NextResponse.json(profile satisfies ApiUserFullProfileResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch profile')
  }
}
