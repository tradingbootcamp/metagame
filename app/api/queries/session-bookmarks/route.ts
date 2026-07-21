import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

import { getAllSessionBookmarks } from '@/app/actions/db/sessionBookmarks'

import { DbSessionBookmark } from '@/types/database/dbTypeAliases'

export type ApiAllSessionBookmarksResponse = DbSessionBookmark[]

export async function GET() {
  try {
    const bookmarks = await getAllSessionBookmarks()

    return NextResponse.json(bookmarks satisfies ApiAllSessionBookmarksResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch all session bookmarks')
  }
}
