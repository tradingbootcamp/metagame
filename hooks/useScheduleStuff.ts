import { useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { currentUserToggleSessionBookmark } from '@/app/actions/db/sessionBookmarks'
import {
  rsvpCurrentUserToSession,
  unrsvpCurrentUserFromSession,
} from '@/app/actions/db/sessionRsvps'
import {
  fetchCurrentUserSessionBookmarks,
  fetchLocations,
  fetchSessions,
} from '@/app/schedule/queries'

import { useUser } from '@/hooks/dbQueries'
import {
  DbFullSession,
  DbFullSessionRsvp,
  DbSessionBookmark,
} from '@/types/database/dbTypeAliases'

export function useScheduleStuff() {
  const { currentUserProfile } = useUser()
  const queryClient = useQueryClient()

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
  })

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  })

  // Fetch user bookmarks
  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks', 'current-user'],
    queryFn: fetchCurrentUserSessionBookmarks,
    enabled: !!currentUserProfile?.id,
  })

  const allRsvps = useMemo(() => {
    return sessions.flatMap((session) => session.rsvps)
  }, [sessions])

  // Get current user's RSVPs
  const currentUserRsvps = useMemo(() => {
    if (!currentUserProfile?.id) return []
    return allRsvps.filter((rsvp) => rsvp.user_id === currentUserProfile.id)
  }, [allRsvps, currentUserProfile?.id])

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
    const sessions = queryClient.getQueryData<DbFullSession[]>(['sessions'])
    const session = sessions?.find((s) => s.id === sessionId)
    if (!session || !session.max_capacity || !session.rsvps?.length)
      return false

    return session.rsvps.length >= session.max_capacity
  }

  // UnRSVP mutation
  const unrsvpCurrentUserFromSessionMutation = useMutation({
    mutationFn: unrsvpCurrentUserFromSession,
    onMutate: async ({ sessionId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['sessions'] })

      // Snapshot the previous values
      const previousSessions = queryClient.getQueryData<DbFullSession[]>([
        'sessions',
      ])

      // Optimistically update RSVPs
      queryClient.setQueryData<DbFullSession[]>(['sessions'], (old) => {
        if (!old) return old
        const oldChangingSession = old.find(
          (session) => session.id === sessionId,
        )
        if (!oldChangingSession) return old
        return old.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                rsvps: session.rsvps.filter(
                  (rsvp) => rsvp.user_id !== currentUserProfile?.id,
                ),
              }
            : session,
        )
      })

      return { previousSessions }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData(['sessions'], context.previousSessions)
      }
      toast.error(err.message)
    },
    onSuccess: () => {
      toast.success('RSVP removed')
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: rsvpCurrentUserToSession,
    onMutate: async ({ sessionId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['sessions'] })

      // Snapshot the previous values
      const previousSessions = queryClient.getQueryData<DbFullSession[]>([
        'sessions',
      ])

      // Optimistically add RSVP (simplified - no waitlist logic)
      const newRsvp: DbFullSessionRsvp = {
        session_id: sessionId,
        user_id: currentUserProfile?.id || '',
        on_waitlist: false, // Let server handle waitlist logic
        created_at: new Date().toISOString(),
        user: {
          id: currentUserProfile?.id || '',
          team: currentUserProfile?.team || 'unassigned',
          first_name: currentUserProfile?.first_name || '',
          last_name: currentUserProfile?.last_name || '',
        },
      }
      queryClient.setQueryData<DbFullSession[]>(['sessions'], (old) => {
        if (!old) return old
        const oldChangingSession = old.find(
          (session) => session.id === sessionId,
        )
        if (!oldChangingSession) return old
        return old.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                rsvps: [...(session.rsvps || []), newRsvp],
              }
            : session,
        )
      })

      return { previousSessions }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData<DbFullSession[]>(
          ['sessions'],
          context.previousSessions,
        )
      }
      toast.error(`RSVP failed: ${err.message}`)
    },
    onSuccess: () => {
      toast.success('RSVP successful!')
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
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
      return { previousBookmarks, isBookmarked }
    },
    onSuccess: (_, __, context) => {
      if (context?.isBookmarked) {
        toast.info('Bookmark removed')
      } else {
        toast.success('Bookmarked')
      }
    },
    onError: (err) => {
      toast.error(err.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', 'current-user'] })
    },
  })

  // Toggle RSVP function
  const toggleRsvp = (sessionId: string) => {
    if (isUserRsvpd(sessionId)) {
      unrsvpCurrentUserFromSessionMutation.mutate({ sessionId })
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
    locations,
    sessions,

    // Helper functions
    getCurrentUserRsvp,
    isUserRsvpd,
    isSessionBookmarked,
    isSessionFull,

    // Mutations
    rsvpMutation,
    unrsvpMutation: unrsvpCurrentUserFromSessionMutation,
    bookmarkMutation,

    // Actions
    toggleRsvp,
    toggleBookmark,

    // Computed states
    isPending:
      rsvpMutation.isPending || unrsvpCurrentUserFromSessionMutation.isPending,
    isRsvpPending: rsvpMutation.isPending,
    isUnrsvpPending: unrsvpCurrentUserFromSessionMutation.isPending,
    isBookmarkPending: bookmarkMutation.isPending,
  }
}
