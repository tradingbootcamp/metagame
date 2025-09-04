'use client'

import { ApiUserPublicProfileResponse } from '../api/queries/profiles/public/[userId]/route'
import { useQuery } from '@tanstack/react-query'

const fetchProfile = async (userId: string) => {
  const response = await fetch(`/api/queries/profiles/public/${userId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch profile')
  }
  return (await response.json()) as ApiUserPublicProfileResponse
}

export const usePublicProfile = (userId: string) => {
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: ['users', 'profile', userId],
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
  })
  return { profile, profileLoading, profileError }
}
