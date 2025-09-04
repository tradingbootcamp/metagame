'use client'

import { useQuery } from '@tanstack/react-query'

import { createClient } from '@/utils/supabase/client'

import { ApiCurrentUserFullProfileResponse } from '@/app/api/queries/profiles/current/route'

export const useUser = () => {
  const {
    data: currentUser,
    isLoading: currentUserLoading,
    isError: currentUserError,
  } = useQuery({
    queryKey: ['users', 'current'],
    queryFn: async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user
    },
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true,
    retry: 1,
  })
  const { data: currentUserProfile } = useQuery({
    queryKey: ['users', 'profile', currentUser!.id],
    queryFn: async () => {
      const response = await fetch('/api/queries/profiles/current')
      if (!response.ok) {
        throw new Error('Failed to fetch current user profile')
      }
      return (await response.json()) as ApiCurrentUserFullProfileResponse
    },
    enabled: !!currentUser?.id,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })

  return {
    currentUser,
    currentUserLoading,
    currentUserError,
    currentUserProfile,
  }
}
