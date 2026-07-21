import { NextResponse } from 'next/server'

/**
 * Standard 500 response for API routes.
 *
 * Everything here runs through the service-role Supabase client, so raw errors
 * carry table/column/constraint names and stacks carry absolute server paths.
 * Only `publicMessage` crosses the wire; the real error is logged server-side,
 * and `details` is included outside production so local debugging still works.
 */
export function apiError(error: unknown, publicMessage: string) {
  console.error(`${publicMessage}:`, error)

  return NextResponse.json(
    {
      error: publicMessage,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV !== 'production' && {
        details: error instanceof Error ? error.stack : String(error),
      }),
    },
    { status: 500 },
  )
}
