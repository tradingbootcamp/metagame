import { NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

import {
  adminGetUserSessionBookmarks,
  currentUserGetSessionBookmarks,
} from '@/app/actions/db/sessionBookmarks'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = params

    // Get current user from server client
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let bookmarks

    // If requesting their own data, allow it using current user wrapper
    if (userId === user.id) {
      bookmarks = await currentUserGetSessionBookmarks()
    } else {
      // Otherwise, require admin privileges
      bookmarks = await adminGetUserSessionBookmarks({ userId })
    }

    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error('Error fetching user session bookmarks:', error)

    // Return more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to fetch session bookmarks',
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
