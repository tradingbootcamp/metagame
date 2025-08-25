import { NextResponse } from 'next/server'

import { adminGetAllSessionBookmarks } from '@/app/actions/db/sessionBookmarks'

export async function GET() {
  try {
    const bookmarks = await adminGetAllSessionBookmarks()

    return NextResponse.json(bookmarks)
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
