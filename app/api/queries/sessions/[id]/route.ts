import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

import { getSessionById } from '@/app/actions/db/sessions'

import { DbFullSession } from '@/types/database/dbTypeAliases'

export type ApiSessionResponse = DbFullSession | null
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionById({ sessionId: (await params).id })

    return NextResponse.json(session satisfies ApiSessionResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch session')
  }
}
