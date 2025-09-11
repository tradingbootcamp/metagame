import { NextRequest, NextResponse } from 'next/server'

import { sessionRsvpsService } from '@/lib/db/sessionRsvps'

export async function POST(request: NextRequest) {
  try {
    // Basic authentication check for cron job
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (!process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 },
      )
    }

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Run the repair function
    const results = await sessionRsvpsService.repairSessionWaitlists()

    const totalPromoted = results.reduce((sum, r) => sum + r.promoted.length, 0)

    return NextResponse.json({
      success: true,
      sessionsRepaired: results.length,
      totalUsersPromoted: totalPromoted,
      results: results.map((r) => ({
        sessionId: r.sessionId,
        type: r.type,
        promotedCount: r.promoted.length,
      })),
    })
  } catch (error) {
    console.error('Waitlist repair cron job failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to repair waitlists',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
