import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

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
    return apiError(error, 'Failed to fetch session bookmarks')
  }
}
