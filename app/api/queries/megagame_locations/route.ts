import { NextResponse } from 'next/server'

import { apiError } from '@/lib/apiError'

import { getAllMegagameLocations } from '@/app/actions/db/locations'

import { DbMegagameLocation } from '@/types/database/dbTypeAliases'

export type ApiAllMegagameLocationsResponse = DbMegagameLocation[]
export async function GET() {
  try {
    const locations = await getAllMegagameLocations()

    return NextResponse.json(
      locations satisfies ApiAllMegagameLocationsResponse,
    )
  } catch (error) {
    return apiError(error, 'Failed to fetch megagame locations')
  }
}
