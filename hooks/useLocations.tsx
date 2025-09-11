'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import { DbLocation } from '@/types/database/dbTypeAliases'

interface LocationsContextType {
  locations: DbLocation[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const LocationsContext = createContext<LocationsContextType | undefined>(
  undefined,
)

export const useLocations = () => {
  const context = useContext(LocationsContext)
  if (context === undefined) {
    throw new Error('useLocations must be used within a LocationsProvider')
  }
  return context
}

interface LocationsProviderProps {
  children: React.ReactNode
}

export const LocationsProvider: React.FC<LocationsProviderProps> = ({
  children,
}) => {
  const [locations, setLocations] = useState<DbLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLocations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/queries/locations')
      if (!response.ok) {
        throw new Error('Failed to fetch locations')
      }
      const data = await response.json()
      setLocations(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching locations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const value: LocationsContextType = {
    locations,
    isLoading,
    error,
    refetch: fetchLocations,
  }

  return (
    <LocationsContext.Provider value={value}>
      {children}
    </LocationsContext.Provider>
  )
}
