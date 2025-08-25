import { NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

import {
  adminGetUserRsvps,
  getCurrentUserRsvps,
} from '@/app/actions/db/sessions'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params

    // Get current user from server client
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let rsvps

    // If requesting their own data, allow it using current user wrapper
    if (userId === user.id) {
      rsvps = await getCurrentUserRsvps()
    } else {
      // Otherwise, require admin privileges
      rsvps = await adminGetUserRsvps({ userId })
    }

    return NextResponse.json(rsvps)
  } catch (error) {
    console.error('Error fetching user RSVPs:', error)

    // Return more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to fetch RSVPs',
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
