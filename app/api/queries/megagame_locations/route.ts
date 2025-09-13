import { NextResponse } from 'next/server'

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
    console.error('Error fetching megagame locations:', error)

    // Return more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to fetch megagame locations',
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
