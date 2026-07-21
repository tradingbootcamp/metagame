import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'
import { sessionBookmarkService } from '@/lib/db/sessionBookmarks'

import { getApiUser, unauthorizedResponse } from '@/app/api/apiAuth'

import { DbSessionBookmark } from '@/types/database/dbTypeAliases'

export type ApiAllSessionBookmarksResponse = DbSessionBookmark[]

export async function GET() {
  try {
    // Maps every attendee to the sessions they are interested in, so attendees only
    const user = await getApiUser()
    if (!user) return unauthorizedResponse()

    const bookmarks = await sessionBookmarkService.getAllSessionBookmarks()

    return NextResponse.json(bookmarks satisfies ApiAllSessionBookmarksResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch all session bookmarks')
  }
}
