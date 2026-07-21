import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

import { getAllLocations } from '@/app/actions/db/locations'

import { DbLocation } from '@/types/database/dbTypeAliases'

export type ApiAllLocationsResponse = DbLocation[]
export async function GET() {
  try {
    const locations = await getAllLocations()

    return NextResponse.json(locations satisfies ApiAllLocationsResponse)
  } catch (error) {
    return apiError(error, 'Failed to fetch locations')
  }
}
