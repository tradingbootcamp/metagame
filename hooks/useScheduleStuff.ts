import { useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { currentUserToggleSessionBookmark } from '@/app/actions/db/sessionBookmarks'
import {
  rsvpCurrentUserToSession,
  unrsvpCurrentUserFromSession,
} from '@/app/actions/db/sessionRsvps'
import {
  fetchAllRsvps,
  fetchCurrentUserSessionBookmarks,
} from '@/app/schedule/queries'

import { useUser } from '@/hooks/dbQueries'
import {
  DbSessionBookmark,
  DbSessionRsvpView,
  DbSessionRsvpWithTeam,
  DbSessionView,
} from '@/types/database/dbTypeAliases'

export function useScheduleStuff() {
  const { currentUserProfile } = useUser()
  const queryClient = useQueryClient()

  // Fetch all RSVPs
  const { data: allRsvps = [] } = useQuery({
    queryKey: ['rsvps'],
    queryFn: fetchAllRsvps,
  })

  // Fetch user bookmarks
  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks', 'current-user'],
    queryFn: fetchCurrentUserSessionBookmarks,
  })

  // Get current user's RSVPs
  const currentUserRsvps = useMemo(() => {
    return allRsvps.filter((rsvp) => rsvp.user_id === currentUserProfile?.id)
  }, [allRsvps, currentUserProfile?.id])

  // Helper function to get RSVPs for a specific session
  const rsvpsBySessionId = (sessionId: string) => {
    return allRsvps.filter((rsvp) => rsvp.session_id === sessionId)
  }

  // Helper function to get current user's RSVP for a specific session
  const getCurrentUserRsvp = (sessionId: string) => {
    return (
      currentUserRsvps.find((rsvp) => rsvp.session_id === sessionId) ?? null
    )
  }

  // Helper function to check if user is RSVP'd for a specific session
  const isUserRsvpd = (sessionId: string) => {
    return currentUserRsvps.some((rsvp) => rsvp.session_id === sessionId)
  }

  // Helper function to check if a session is bookmarked by current user
  const isSessionBookmarked = (sessionId: string) => {
    return bookmarks.some((bookmark) => bookmark.session_id === sessionId)
  }

  // Helper function to check if a session is at capacity
  const isSessionFull = (sessionId: string) => {
    const sessions = queryClient.getQueryData(['sessions']) as
      | DbSessionView[]
      | undefined
    const session = sessions?.find((s) => s.id === sessionId)
    return (
      session?.max_capacity !== null &&
      (session?.rsvp_count || 0) >= (session?.max_capacity || 0)
    )
  }

  // UnRSVP mutation
  const unrsvpMutation = useMutation({
    mutationFn: unrsvpCurrentUserFromSession,
    onMutate: async ({ sessionId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['rsvps'] })
      await queryClient.cancelQueries({ queryKey: ['sessions'] })

      // Snapshot the previous values
      const previousRsvps = queryClient.getQueryData(['rsvps'])
      const previousSessions = queryClient.getQueryData(['sessions'])

      // Optimistically update RSVPs
      queryClient.setQueryData(
        ['rsvps'],
        (old: DbSessionRsvpView[] | undefined) =>
          old?.filter(
            (rsvp) =>
              !(
                rsvp.session_id === sessionId &&
                rsvp.user_id === currentUserProfile?.id
              ),
          ) || [],
      )

      // Optimistically update sessions (decrease RSVP count)
      queryClient.setQueryData(
        ['sessions'],
        (old: DbSessionView[] | undefined) =>
          old?.map((s) =>
            s.id === sessionId
              ? { ...s, rsvp_count: Math.max(0, (s.rsvp_count || 0) - 1) }
              : s,
          ) || [],
      )

      return { previousRsvps, previousSessions }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousRsvps) {
        queryClient.setQueryData(['rsvps'], context.previousRsvps)
      }
      if (context?.previousSessions) {
        queryClient.setQueryData(['sessions'], context.previousSessions)
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['rsvps'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: rsvpCurrentUserToSession,
    onMutate: async ({ sessionId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['rsvps'] })
      await queryClient.cancelQueries({ queryKey: ['sessions'] })

      // Snapshot the previous values
      const previousRsvps = queryClient.getQueryData(['rsvps'])
      const previousSessions = queryClient.getQueryData(['sessions'])

      // Optimistically add RSVP (simplified - no waitlist logic)
      const newRsvp: DbSessionRsvpWithTeam = {
        session_id: sessionId,
        user_id: currentUserProfile?.id || '',
        on_waitlist: false, // Let server handle waitlist logic
        created_at: new Date().toISOString(),
        profiles: {
          team: currentUserProfile?.team || 'unassigned',
        },
      }

      queryClient.setQueryData(
        ['rsvps'],
        (old: DbSessionRsvpView[] | undefined) => [...(old || []), newRsvp],
      )

      // Optimistically update sessions (increase RSVP count)
      queryClient.setQueryData(
        ['sessions'],
        (old: DbSessionView[] | undefined) =>
          old?.map((s) =>
            s.id === sessionId
              ? { ...s, rsvp_count: (s.rsvp_count || 0) + 1 }
              : s,
          ) || [],
      )

      return { previousRsvps, previousSessions }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousRsvps) {
        queryClient.setQueryData(['rsvps'], context.previousRsvps)
      }
      if (context?.previousSessions) {
        queryClient.setQueryData(['sessions'], context.previousSessions)
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['rsvps'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: currentUserToggleSessionBookmark,
    onMutate: async ({ sessionId }) => {
      await queryClient.cancelQueries({
        queryKey: ['bookmarks', 'current-user'],
      })
      const previousBookmarks = queryClient.getQueryData([
        'bookmarks',
        'current-user',
      ])

      const isBookmarked = isSessionBookmarked(sessionId)

      if (isBookmarked) {
        queryClient.setQueryData(
          ['bookmarks', 'current-user'],
          (old: DbSessionBookmark[] | undefined) =>
            old?.filter((bookmark) => bookmark.session_id !== sessionId) || [],
        )
      } else {
        queryClient.setQueryData(
          ['bookmarks', 'current-user'],
          (old: DbSessionBookmark[] | undefined) => [
            ...(old || []),
            { session_id: sessionId, user_id: currentUserProfile?.id || '' },
          ],
        )
      }
      return { previousBookmarks }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', 'current-user'] })
    },
  })

  // Toggle RSVP function
  const toggleRsvp = (sessionId: string) => {
    if (isUserRsvpd(sessionId)) {
      unrsvpMutation.mutate({ sessionId })
    } else {
      rsvpMutation.mutate({ sessionId })
    }
  }

  // Toggle bookmark function
  const toggleBookmark = (sessionId: string) => {
    bookmarkMutation.mutate({ sessionId })
  }

  return {
    // Data
    allRsvps,
    currentUserRsvps,
    bookmarks,

    // Helper functions
    rsvpsBySessionId,
    getCurrentUserRsvp,
    isUserRsvpd,
    isSessionBookmarked,
    isSessionFull,

    // Mutations
    rsvpMutation,
    unrsvpMutation,
    bookmarkMutation,

    // Actions
    toggleRsvp,
    toggleBookmark,

    // Computed states
    isPending: rsvpMutation.isPending || unrsvpMutation.isPending,
    isRsvpPending: rsvpMutation.isPending,
    isUnrsvpPending: unrsvpMutation.isPending,
    isBookmarkPending: bookmarkMutation.isPending,
  }
}
