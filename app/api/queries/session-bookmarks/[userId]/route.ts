import { NextRequest, NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'
import { sessionBookmarkService } from '@/lib/db/sessionBookmarks'

import { getApiUser, unauthorizedResponse } from '@/app/api/apiAuth'

import { DbSessionBookmark } from '@/types/database/dbTypeAliases'

export type ApiUserSessionBookmarksResponse = DbSessionBookmark[]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    // Another attendee's saved sessions, so attendees only
    const user = await getApiUser()
    if (!user) return unauthorizedResponse()

    const { userId } = await params
    const bookmarks = await sessionBookmarkService.getUserSessionBookmarks({
      userId,
    })

    return NextResponse.json(
      bookmarks satisfies ApiUserSessionBookmarksResponse,
    )
  } catch (error) {
    return apiError(error, 'Failed to fetch session bookmarks')
  }
}
