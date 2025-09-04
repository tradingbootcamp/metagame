import { NextResponse } from 'next/server'

import { getSessionById } from '@/app/actions/db/sessions'
import {
  sessionCalendarDateString,
  sessionCalendarDescription,
} from '@/app/schedule/scheduleUtils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionById({ sessionId: (await params).id })
    if (!session) {
      return new Response('Session not found', { status: 404 })
    }
    if (!session.start_time || !session.end_time) {
      return new Response('Session is missing start or end time', {
        status: 400,
      })
    }
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Metagame//EN
BEGIN:VEVENT
UID:${session.id}@metagame.wtf
DTSTAMP:${sessionCalendarDateString(new Date())}
DTSTART:${sessionCalendarDateString(new Date(session.start_time ?? ''))}
DTEND:${sessionCalendarDateString(new Date(session.end_time))}
SUMMARY:${escapeICSText(session.title ?? '')}
DESCRIPTION:${escapeICSText(sessionCalendarDescription(session))}
LOCATION:'2740 Telegraph Ave\\, Berkeley\\, CA 94705'
END:VEVENT
END:VCALENDAR`

    return new Response(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="metagame-${session.title}-${session.id.slice(0, 5)}.ics"`,
      },
    })
  } catch (error) {
    console.error('Error getting calendar event for session:', error)

    // Return more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to get calendar event for session',
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\') // escape backslashes
    .replace(/\n/g, '\\n') // literal \n for newlines
    .replace(/,/g, '\\,') // commas must be escaped
    .replace(/;/g, '\\;') // semicolons too
}
