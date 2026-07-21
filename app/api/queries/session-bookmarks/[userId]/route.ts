import { NextRequest, NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

import { getUserSessionBookmarks } from '@/app/actions/db/sessionBookmarks'

import { DbSessionBookmark } from '@/types/database/dbTypeAliases'

export type ApiUserSessionBookmarksResponse = DbSessionBookmark[]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params
    const bookmarks = await getUserSessionBookmarks({ userId })

    return NextResponse.json(
      bookmarks satisfies ApiUserSessionBookmarksResponse,
    )
  } catch (error) {
    return apiError(error, 'Failed to fetch session bookmarks')
  }
}
