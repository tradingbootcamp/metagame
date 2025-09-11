import { NextResponse } from 'next/server'

import { locationsService } from '@/lib/db/locations'

export async function GET() {
  try {
    const locations = await locationsService.getAllLocations()
    return NextResponse.json(locations)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 },
    )
  }
}
