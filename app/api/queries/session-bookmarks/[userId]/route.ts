import { NextResponse } from 'next/server'

import { getUserSessionBookmarks } from '@/app/actions/db/sessionBookmarks'

import { DbSessionBookmark } from '@/types/database/dbTypeAliases'

export type ApiUserSessionBookmarksResponse = DbSessionBookmark[]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params
    const bookmarks = await getUserSessionBookmarks({ userId })

    return NextResponse.json(
      bookmarks satisfies ApiUserSessionBookmarksResponse,
    )
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
