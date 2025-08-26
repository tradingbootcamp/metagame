import { useQuery } from '@tanstack/react-query'

import { getCurrentUser, getCurrentUserProfile } from '@/app/actions/db/users'

export const useUser = () => {
  const {
    data: currentUser,
    isLoading: currentUserLoading,
    isError: currentUserError,
  } = useQuery({
    queryKey: ['users', 'current'],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true,
    retry: 1,
  })
  const { data: currentUserProfile } = useQuery({
    queryKey: ['users', 'profile', 'current-user'],
    queryFn: () => getCurrentUserProfile(),
    enabled: !!currentUser?.id,
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
