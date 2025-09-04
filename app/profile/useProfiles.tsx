'use client'

import { useMemo } from 'react'

import { ApiUserPublicProfileResponse } from '../api/queries/profiles/public/[userId]/route'
import {
  ApiAllPublicProfilesResponse,
  ApiUsersPublicProfilesResponse,
} from '../api/queries/profiles/public/route'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { DbPublicProfile } from '@/types/database/dbTypeAliases'

const fetchBulkPublicProfiles = async (
  userIds: string[],
): Promise<ApiUsersPublicProfilesResponse> => {
  const response = await fetch('/api/queries/profiles/public', {
    method: 'POST',
    body: JSON.stringify({ userIds }),
  })
  if (!response.ok) throw new Error('Failed to fetch profiles')
  return await response.json()
}
const fetchAllPublicProfiles =
  async (): Promise<ApiAllPublicProfilesResponse> => {
    const response = await fetch('/api/queries/profiles/public')
    if (!response.ok) throw new Error('Failed to fetch profiles')
    return await response.json()
  }
const fetchPublicProfile = async (
  userId: string,
): Promise<ApiUserPublicProfileResponse> => {
  const response = await fetch(`/api/queries/profiles/public/${userId}`)
  if (!response.ok) throw new Error('Failed to fetch profile')
  return await response.json()
}

export const usePublicProfiles = ({
  userIds,
  includeFullProfiles,
}: {
  userIds: string[] | null | undefined
  includeFullProfiles: boolean
}) => {
  const qc = useQueryClient()

  // Stable, deduped ids and a deterministic key to avoid key thrash
  const ids = useMemo(() => {
    if (!userIds?.length) return [] as string[]
    const deduped = Array.from(new Set(userIds.filter(Boolean)))
    return deduped
  }, [userIds])

  const idsKey = useMemo(() => ids.join(','), [ids]) // 'id1, id2, id3

  const query = useQuery({
    queryKey: ['users', 'profiles', idsKey],
    enabled: ids.length > 0,
    queryFn: async () => {
      const profiles: DbPublicProfile[] = includeFullProfiles
        ? await fetchAllPublicProfiles()
        : await fetchBulkPublicProfiles(ids)

      // Seed per-item caches so useProfile(id) (single) is instant later
      profiles.forEach((p, i) => {
        const id = ids[i]
        if (p && id) {
          qc.setQueryData<DbPublicProfile>(['users', 'profile', id], p)
        }
      })

      return profiles
    },
    placeholderData: (prev) => prev,
  })

  const {
    data: profiles,
    isLoading: profilesLoading,
    isError: profilesError,
  } = query

  return { profiles, profilesLoading, profilesError }
}

export const usePublicProfile = (userId: string | null | undefined) => {
  return useQuery<DbPublicProfile | null>({
    queryKey: ['users', 'profile', userId],
    enabled: !!userId,
    queryFn: async () => fetchPublicProfile(userId!),
  })
}
