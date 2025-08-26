import { useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  rsvpCurrentUserToSession,
  unrsvpCurrentUserFromSession,
} from '@/app/actions/db/sessionRsvps'
import { fetchAllRsvps } from '@/app/schedule/queries'

import { useUser } from '@/hooks/dbQueries'
import {
  DbSessionRsvpView,
  DbSessionRsvpWithTeam,
  DbSessionView,
} from '@/types/database/dbTypeAliases'

export function useSessionRsvp() {
  const { currentUserProfile } = useUser()
  const queryClient = useQueryClient()

  // Fetch all RSVPs
  const { data: allRsvps = [] } = useQuery({
    queryKey: ['rsvps'],
    queryFn: fetchAllRsvps,
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
      await queryClient.invalidateQueries({ queryKey: ['rsvps'] })
      await queryClient.invalidateQueries({ queryKey: ['sessions'] })

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
      await queryClient.invalidateQueries({ queryKey: ['rsvps'] })
      await queryClient.invalidateQueries({ queryKey: ['sessions'] })

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

  // Toggle RSVP function
  const toggleRsvp = (sessionId: string) => {
    if (isUserRsvpd(sessionId)) {
      unrsvpMutation.mutate({ sessionId })
    } else {
      rsvpMutation.mutate({ sessionId })
    }
  }

  return {
    // Data
    allRsvps,
    currentUserRsvps,

    // Helper functions
    rsvpsBySessionId,
    getCurrentUserRsvp,
    isUserRsvpd,
    isSessionFull,

    // Mutations
    rsvpMutation,
    unrsvpMutation,

    // Actions
    toggleRsvp,

    // Computed states
    isPending: rsvpMutation.isPending || unrsvpMutation.isPending,
    isRsvpPending: rsvpMutation.isPending,
    isUnrsvpPending: unrsvpMutation.isPending,
  }
}
