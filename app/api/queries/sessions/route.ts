import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

import { getAllSessions } from '@/app/actions/db/sessions'

import { DbFullSession } from '@/types/database/dbTypeAliases'

export type ApiAllSessionsResponse = DbFullSession[]
export async function GET() {
  try {
    const sessions = await getAllSessions()

    return NextResponse.json(sessions satisfies ApiAllSessionsResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch sessions')
  }
}
