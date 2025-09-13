'use client'

import { ApiAllLocationsResponse } from '../app/api/queries/locations/route'
import { ApiAllMegagameLocationsResponse } from '../app/api/queries/megagame_locations/route'
import { useQuery } from '@tanstack/react-query'

const fetchLocations = async (): Promise<ApiAllLocationsResponse> => {
  const response = await fetch('/api/queries/locations')
  if (!response.ok) {
    throw new Error('Failed to fetch locations')
  }
  return await response.json()
}

const fetchMegagameLocations =
  async (): Promise<ApiAllMegagameLocationsResponse> => {
    const response = await fetch('/api/queries/megagame_locations')
    if (!response.ok) {
      throw new Error('Failed to fetch locations')
    }
    return await response.json()
  }

export const useLocations = () => {
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  })
  const { data: megagame_locations = [] } = useQuery({
    queryKey: ['megagame_locations'],
    queryFn: fetchMegagameLocations,
    refetchInterval: 1 * 60 * 1000, // Refetch every minute to keep data fresh
  })
  return { locations, megagame_locations }
}
