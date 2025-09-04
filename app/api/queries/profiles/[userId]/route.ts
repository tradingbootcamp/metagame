import { NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

import {
  adminGetUserFullProfileById,
  getCurrentUserFullProfile,
} from '@/app/actions/db/users'

import { DbFullProfile } from '@/types/database/dbTypeAliases'

export type ApiUserFullProfileResponse = DbFullProfile | null

export async function GET(
  request: Request,
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
