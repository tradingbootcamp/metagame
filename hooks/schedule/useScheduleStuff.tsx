'use client'

import { useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
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
} from '@/hooks/schedule/queries'
import { useUser } from '@/hooks/useUser'
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
    queryKey: ['bookmarks', 'current'],
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
    if (!session || !session.max_capacity) return false

    if (session.megagame) {
      const team = currentUserProfile?.team
      if (team === 'orange' || team === 'purple') {
        const teamCap = Math.floor(session.max_capacity / 2)
        const currentTeamGoing = (session.rsvps || []).filter(
          (r) => r.user.team === team && !r.on_waitlist,
        ).length
        return currentTeamGoing >= teamCap
      }
      return false
    }

    const goingCount = (session.rsvps || []).filter(
      (r) => !r.on_waitlist,
    ).length
    return goingCount >= session.max_capacity
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

      // Get session info before optimistic update
      const session = previousSessions?.find((s) => s.id === sessionId)

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

      return { previousSessions, session }
    },
    onError: (err, _variables, context) => {
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
      queryClient.invalidateQueries({ queryKey: ['sessions'], exact: false })
    },
  })

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      const firstName = (currentUserProfile?.first_name || '').trim()
      if (!firstName) {
        throw new Error('PROFILE_FIRST_NAME_REQUIRED')
      }
      return rsvpCurrentUserToSession({ sessionId })
    },
    onMutate: async ({ sessionId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['sessions'] })

      // Snapshot the previous values
      const previousSessions = queryClient.getQueryData<DbFullSession[]>([
        'sessions',
      ])

      // If profile missing first name, do not optimistically update
      const firstName = (currentUserProfile?.first_name || '').trim()
      if (!firstName) {
        return { previousSessions, aborted: true as const }
      }

      // Optimistically add RSVP (simplified - no waitlist logic)
      // Determine optimistic waitlist based on megagame team caps
      const sessions = queryClient.getQueryData<DbFullSession[]>(['sessions'])
      const session = sessions?.find((s) => s.id === sessionId)
      const userTeam = currentUserProfile?.team || 'unassigned'
      let optimisticWaitlist = false
      if (session?.megagame && session.max_capacity) {
        const teamCap = Math.floor(session.max_capacity / 2)
        const currentTeamGoing = (session.rsvps || []).filter(
          (r) => r.user.team === userTeam && !r.on_waitlist,
        ).length
        optimisticWaitlist = currentTeamGoing >= teamCap
      }

      const newRsvp: DbFullSessionRsvp = {
        session_id: sessionId,
        user_id: currentUserProfile?.id || '',
        on_waitlist: optimisticWaitlist, // Server will confirm
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

      return { previousSessions, session }
    },
    onError: (err, _variables, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData<DbFullSession[]>(
          ['sessions'],
          context.previousSessions,
        )
      }
      if (
        err instanceof Error &&
        err.message === 'PROFILE_FIRST_NAME_REQUIRED'
      ) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span>Your profile is incomplete.</span>
            <span>Please set your first name in order to RSVP.</span>
            <Link
              href="/profile"
              className="mt-1 w-fit underline underline-offset-2 hover:opacity-90"
            >
              Go to your profile →
            </Link>
          </div>,
          { duration: 6000 },
        )
        return
      }
      toast.error(`RSVP failed: ${err.message}`)
    },
    onSuccess: (result, _variables, context) => {
      if (result && result.on_waitlist) {
        if (context?.session?.megagame) {
          const team = result.user.team
          const teamLabel = team.charAt(0).toUpperCase() + team.slice(1)
          toast.info(`Added to ${teamLabel} team waitlist.`)
        } else {
          toast.info('Added to waitlist.')
        }
      } else {
        toast.success('RSVP successful!')
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['sessions'], exact: false })
    },
  })

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: currentUserToggleSessionBookmark,
    onMutate: async ({ sessionId }) => {
      await queryClient.cancelQueries({
        queryKey: ['bookmarks', 'current'],
      })
      const previousBookmarks = queryClient.getQueryData([
        'bookmarks',
        'current',
      ])

      const isBookmarked = isSessionBookmarked(sessionId)

      if (isBookmarked) {
        queryClient.setQueryData(
          ['bookmarks', 'current'],
          (old: DbSessionBookmark[] | undefined) =>
            old?.filter((bookmark) => bookmark.session_id !== sessionId) || [],
        )
      } else {
        queryClient.setQueryData(
          ['bookmarks', 'current'],
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
      queryClient.invalidateQueries({
        queryKey: ['bookmarks', 'current'],
        exact: false,
      })
    },
  })

  // Toggle RSVP function
  const toggleRsvp = (sessionId: string) => {
    if (isUserRsvpd(sessionId)) {
      unrsvpCurrentUserFromSessionMutation.mutate({ sessionId })
    } else {
      // Guard: require first name before allowing RSVP
      const firstName = (currentUserProfile?.first_name || '').trim()
      if (!firstName) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span>Your profile is incomplete.</span>
            <span>Please set your first name in order to RSVP.</span>
            <Link
              href="/profile"
              className="mt-1 w-fit underline underline-offset-2 hover:opacity-90"
            >
              Go to your profile →
            </Link>
          </div>,
          { duration: 6000 },
        )
        return
      }
      // Pre-check megagame rules client-side for better UX
      const sessions = queryClient.getQueryData<DbFullSession[]>(['sessions'])
      const session = sessions?.find((s) => s.id === sessionId)
      if (session?.megagame) {
        const team = currentUserProfile?.team
        if (team === 'green') {
          toast.error("Green team can't RSVP for megagame events!")
          return
        }
        if (!team || team === 'unassigned') {
          toast.error(
            'Assign yourself to Orange or Purple to RSVP for a megagame.',
          )
          return
        }
      }
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
