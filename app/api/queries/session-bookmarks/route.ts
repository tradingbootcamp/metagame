import { NextResponse } from 'next/server'

import { getAllSessionBookmarks } from '@/app/actions/db/sessionBookmarks'

import { DbSessionBookmark } from '@/types/database/dbTypeAliases'

export type ApiAllSessionBookmarksResponse = DbSessionBookmark[]

export async function GET() {
  try {
    const bookmarks = await getAllSessionBookmarks()

    return NextResponse.json(bookmarks satisfies ApiAllSessionBookmarksResponse)
  } catch (error) {
    console.error('Error fetching all session bookmarks:', error)

    // Return more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to fetch all session bookmarks',
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
