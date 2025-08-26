'use client'

import { useMemo, useState } from 'react'

import { AddEventModal } from './EditEventModal'
import { AttendanceDisplay } from './Schedule'
import { fetchAllRsvps, fetchCurrentUserSessionBookmarks } from './queries'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckIcon, EditIcon, LinkIcon, StarIcon, UserIcon } from 'lucide-react'

import { dateUtils } from '@/utils/dateUtils'
import { dbGetHostsFromSession } from '@/utils/dbUtils'

import { SessionTitle } from '@/components/SessionTitle'

import { currentUserToggleSessionBookmark } from '@/app/actions/db/sessionBookmarks'
import {
  rsvpCurrentUserToSession,
  unrsvpCurrentUserFromSession,
} from '@/app/actions/db/sessionRsvps'

import { useUser } from '@/hooks/dbQueries'
import {
  DbSessionBookmark,
  DbSessionRsvpView,
  DbSessionRsvpWithTeam,
  DbSessionView,
} from '@/types/database/dbTypeAliases'

export default function SessionDetailsCard({
  session,
  canEdit = false,
}: {
  session: DbSessionView
  canEdit?: boolean
}) {
  const { currentUserProfile } = useUser()
  const [showCopiedMessage, setShowCopiedMessage] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const { data: bookmarks } = useQuery({
    queryKey: ['bookmarks', 'current-user'],
    queryFn: fetchCurrentUserSessionBookmarks,
  })
  const sessionBookmarked = useMemo(
    () =>
      bookmarks?.some((bookmark) => bookmark.session_id === session.id!) ??
      false,
    [bookmarks, session.id],
  )

  const { data: allRsvps = [] } = useQuery({
    queryKey: ['rsvps'],
    queryFn: fetchAllRsvps,
  })
  const sessionRsvps = useMemo(() => {
    return allRsvps.filter((rsvp) => rsvp.session_id === session.id)
  }, [allRsvps, session.id])
  const currentUserRsvp = useMemo(() => {
    return sessionRsvps.find((rsvp) => rsvp.user_id === currentUserProfile?.id)
  }, [sessionRsvps, currentUserProfile?.id])
  const bookmarkMutation = useMutation({
    mutationFn: () =>
      currentUserToggleSessionBookmark({ sessionId: session.id! }),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['bookmarks', 'current-user'],
      })
      const previousBookmarks = queryClient.getQueryData([
        'bookmarks',
        'current-user',
      ])
      if (sessionBookmarked) {
        queryClient.setQueryData(
          ['bookmarks', 'current-user'],
          (old: DbSessionBookmark[] | undefined) =>
            old?.filter((bookmark) => bookmark.session_id !== session.id!) ||
            [],
        )
      } else {
        queryClient.setQueryData(
          ['bookmarks', 'current-user'],
          (old: DbSessionBookmark[] | undefined) => [
            ...(old || []),
            { session_id: session.id!, user_id: currentUserProfile?.id || '' },
          ],
        )
      }
      return { previousBookmarks }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', 'current-user'] })
    },
  })
  // Check if session is at capacity
  const isSessionFull =
    session.max_capacity !== null &&
    (session.rsvp_count || 0) >= session.max_capacity
  const queryClient = useQueryClient()
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
        queryClient.setQueryData(
          ['rsvps', 'current-user'],
          context.previousRsvps,
        )
      }
      if (context?.previousSessions) {
        queryClient.setQueryData(['sessions'], context.previousSessions)
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['rsvps', 'current-user'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const rsvpMutation = useMutation({
    mutationFn: rsvpCurrentUserToSession,
    onMutate: async () => {
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
        session_id: session.id!,
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
            s.id === session.id!
              ? { ...s, rsvp_count: (s.rsvp_count || 0) + 1 }
              : s,
          ) || [],
      )

      return { previousRsvps, previousSessions }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousRsvps) {
        queryClient.setQueryData(
          ['rsvps', 'current-user'],
          context.previousRsvps,
        )
      }
      if (context?.previousSessions) {
        queryClient.setQueryData(['sessions'], context.previousSessions)
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['rsvps', 'current-user'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const handleToggleRsvp = () => {
    if (!!currentUserRsvp) {
      unrsvpMutation.mutate({ sessionId: session.id! })
    } else {
      rsvpMutation.mutate({ sessionId: session.id! })
    }
  }

  const copyLink = () => {
    const base = window.location.origin
    const fullUrl = `${base}/schedule?session=${session.id!}`
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        console.log('Copied:', fullUrl)
        setShowCopiedMessage(true)
        setTimeout(() => setShowCopiedMessage(false), 2000)
      })
      .catch((err) => {
        console.error('Failed to copy:', err)
        setCopyError(true)
        setTimeout(() => setCopyError(false), 2000)
      })
  }

  return (
    <div className="bg-dark-600 border-secondary-300 relative max-h-[calc(100vh-100px)] w-full max-w-xl overflow-auto rounded-xl border p-4 shadow-2xl lg:min-w-[480px] lg:p-6">
      {/* Content */}
      <div className="flex flex-col gap-2">
        {/* Title and Hosts*/}
        <div className="flex flex-col gap-1">
          <div className="flex w-full justify-between gap-2">
            <h2 className="text-secondary-200 text-xl leading-tight font-bold">
              <SessionTitle title={session.title || 'Untitled Session'} />
            </h2>
            <div className="flex w-fit gap-1 self-start">
              {showCopiedMessage ? (
                <span className="text-light p-1 text-green-400">✓</span>
              ) : (
                <button
                  onClick={copyLink}
                  className="hover:bg-dark-400 cursor-pointer rounded-md p-1 transition-colors"
                >
                  <LinkIcon
                    className={`size-4 ${copyError ? 'text-red-500' : 'text-secondary-300'}`}
                  />
                </button>
              )}

              {/* Edit button for admins */}
              {canEdit && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="hover:bg-dark-400 cursor-pointer rounded-md p-1 transition-colors"
                  title="Edit Event"
                >
                  <EditIcon className="text-secondary-300 size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Hosts */}
          <div className="text-secondary-400 text-sm">
            {dbGetHostsFromSession(session).join(', ')}
          </div>
        </div>

        {/* Time & Date */}
        {session.start_time && (
          <div className="space-y-1">
            {currentUserProfile?.id && (
              <div className="flex items-center gap-3">
                <button
                  className="group p-1 hover:cursor-pointer rounded-xs"
                  onClick={() => bookmarkMutation.mutate()}
                >
                  <StarIcon
                    fill={sessionBookmarked ? 'yellow' : 'none'}
                    strokeWidth={1}
                    className={`size-4 ${sessionBookmarked ? 'text-yellow-400' : 'text-gray-300 group-hover:text-yellow-400'}`}
                  />
                </button>
                {!!currentUserRsvp ? (
                  <>
                    <span
                      className={`font-semibold ${currentUserRsvp.on_waitlist ? 'text-yellow-400' : 'text-green-400'}`}
                    >
                      {currentUserRsvp.on_waitlist ? 'Waitlist' : "RSVP'D"}
                    </span>
                    <button
                      className="cursor-pointer text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={handleToggleRsvp}
                      disabled={
                        rsvpMutation.isPending || unrsvpMutation.isPending
                      }
                    >
                      {unrsvpMutation.isPending ? 'Un-RSVPing...' : 'Un-RSVP'}
                    </button>
                  </>
                ) : (
                  <button
                    className="cursor-pointer text-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleToggleRsvp}
                    disabled={
                      rsvpMutation.isPending || unrsvpMutation.isPending
                    }
                  >
                    {rsvpMutation.isPending
                      ? 'RSVPing...'
                      : isSessionFull
                        ? 'Join Waitlist'
                        : 'RSVP'}
                  </button>
                )}
              </div>
            )}
            <div className="text-secondary-300 font-medium">
              📅 {dateUtils.getStringDate(session.start_time)}
            </div>
            <div className="text-secondary-300">
              🕐 {dateUtils.getStringTime(session.start_time)}
              {session.end_time &&
                ` - ${dateUtils.getStringTime(session.end_time)}`}
            </div>
          </div>
        )}
        {/* Description */}
        {session.description && (
          <div className="space-y-2">
            <div className="text-secondary-300 text-base leading-relaxed font-light whitespace-pre-wrap">
              {session.description}
            </div>
          </div>
        )}

        {/* Location and Attendance */}
        <div className="flex w-full justify-between gap-1">
          <div className="text-secondary-300">
            📍 {session.location_name || 'TBD'}
          </div>
          {session.max_capacity && (
            <div className="text-secondary-300">
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center">
                  {currentUserRsvp && (
                    <CheckIcon
                      className={`mr-1 inline-block size-4 ${currentUserRsvp.on_waitlist ? 'bg-gray-600 text-yellow-600' : 'bg-white text-green-600'} rounded-full p-0.5`}
                      strokeWidth={3}
                    />
                  )}
                  <UserIcon className="mr-1 inline-block size-4" />{' '}
                  <AttendanceDisplay
                    session={session}
                    sessionRsvps={sessionRsvps}
                    currentUserProfile={currentUserProfile ?? null}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AddEventModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        existingSessionId={session.id}
        canEdit={canEdit}
      />
    </div>
  )
}
