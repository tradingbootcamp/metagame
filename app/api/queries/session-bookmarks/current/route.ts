import { NextResponse } from 'next/server'

import { currentUserGetSessionBookmarks } from '@/app/actions/db/sessionBookmarks'

import { DbSessionBookmark } from '@/types/database/dbTypeAliases'

export type ApiCurrentUserSessionBookmarksResponse = DbSessionBookmark[]
export async function GET() {
  try {
    const bookmarks = await currentUserGetSessionBookmarks()

    return NextResponse.json(
      bookmarks satisfies ApiCurrentUserSessionBookmarksResponse,
    )
  } catch (error) {
    console.error('Error fetching current user session bookmarks:', error)

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
