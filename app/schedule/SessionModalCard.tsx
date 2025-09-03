'use client'

import { useState } from 'react'

import { AddEventModal } from './EditEventModal'
import { AttendanceDisplay } from './RSVPList'
import { gCalLinkFromSession } from './calendar'
import {
  CalendarIcon,
  CheckIcon,
  EditIcon,
  LinkIcon,
  StarIcon,
  UserIcon,
} from 'lucide-react'

import { dateUtils } from '@/utils/dateUtils'
import { SESSION_AGES, dbGetHostsFromSession } from '@/utils/dbUtils'

import { SessionTitle } from '@/components/SessionTitle'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'

import { useUser } from '@/hooks/dbQueries'
import { useScheduleStuff } from '@/hooks/useScheduleStuff'
import { DbFullSession } from '@/types/database/dbTypeAliases'

export default function SessionDetailsCard({
  session,
  showButtons,
  canEdit = false,
}: {
  session: DbFullSession
  showButtons: boolean
  canEdit?: boolean
}) {
  const { currentUserProfile, currentUser } = useUser()
  const [showCopiedMessage, setShowCopiedMessage] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Use the comprehensive schedule hook
  const {
    getCurrentUserRsvp,
    isSessionFull,
    toggleRsvp,
    isUserRsvpd,
    isSessionBookmarked,
    toggleBookmark,
    isPending,
    isRsvpPending,
    isUnrsvpPending,
  } = useScheduleStuff()

  const currentUserRsvp = getCurrentUserRsvp(session.id!)
  const isRsvpd = isUserRsvpd(session.id!)
  const sessionBookmarked = isSessionBookmarked(session.id!)

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
    <div className="relative max-h-[calc(100vh-100px)] w-full max-w-xl overflow-auto rounded-xl border border-secondary-300 bg-dark-600 p-4 shadow-2xl lg:min-w-[480px] lg:p-6">
      {/* Content */}
      <div className="flex flex-col gap-2">
        {/* Title and Hosts*/}
        <div className="flex flex-col gap-1">
          <div className="flex w-full justify-between gap-2">
            <h2 className="text-xl leading-tight font-bold text-secondary-200">
              <SessionTitle title={session.title || 'Untitled Session'} />
            </h2>
            {showButtons && (
              <div className="flex w-fit gap-1 self-start">
                {showCopiedMessage ? (
                  <span className="text-light p-1 text-green-400">✓</span>
                ) : (
                  <button
                    onClick={copyLink}
                    className="cursor-pointer rounded-md p-1 transition-colors hover:bg-dark-400"
                  >
                    <LinkIcon
                      className={`size-4 ${copyError ? 'text-red-500' : 'text-secondary-300'}`}
                    />
                  </button>
                )}
                <a
                  href={gCalLinkFromSession(session)}
                  className={buttonVariants({ variant: 'ghost' })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CalendarIcon className={`size-4 text-secondary-300`} />
                </a>
                {/* Edit button for admins */}
                {canEdit && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="cursor-pointer rounded-md p-1 transition-colors hover:bg-dark-400"
                    title="Edit Event"
                  >
                    <EditIcon className="size-4 text-secondary-300" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Hosts */}
          <div className="text-sm text-secondary-400">
            {dbGetHostsFromSession(session).join(', ')}
          </div>
        </div>

        {/* Time & Date */}
        {session.start_time && (
          <div className="space-y-1">
            {currentUserProfile?.id && showButtons && (
              <div className="flex items-center gap-3">
                <button
                  className="group rounded-xs p-1 hover:cursor-pointer"
                  onClick={() => toggleBookmark(session.id!)}
                >
                  <StarIcon
                    fill={sessionBookmarked ? 'yellow' : 'none'}
                    strokeWidth={1}
                    className={`size-4 ${sessionBookmarked ? 'text-yellow-400' : 'text-gray-300 group-hover:text-yellow-400'}`}
                  />
                </button>
                {isRsvpd ? (
                  <>
                    <button
                      className="cursor-pointer text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => toggleRsvp(session.id!)}
                      disabled={isPending}
                    >
                      {isUnrsvpPending ? 'Un-RSVPing...' : 'Un-RSVP'}
                      {currentUserRsvp?.on_waitlist && (
                        <span className="ml-1 text-yellow-400">
                          (On Waitlist)
                        </span>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    className="cursor-pointer text-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => toggleRsvp(session.id!)}
                    disabled={isPending}
                  >
                    {isRsvpPending
                      ? 'RSVPing...'
                      : isSessionFull(session.id!)
                        ? 'Join Waitlist'
                        : 'RSVP'}
                  </button>
                )}
              </div>
            )}
            <div className="font-medium text-secondary-300">
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
            <div className="text-base leading-relaxed font-light whitespace-pre-wrap text-secondary-300">
              {session.description}
            </div>
          </div>
        )}

        {/* Location and Attendance */}
        <div className="flex w-full justify-between gap-1">
          <div className="text-secondary-300">
            📍 {session.location?.name || 'TBD'}
          </div>
          {session.max_capacity && (
            <div className="text-secondary-300">
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  {session.ages === SESSION_AGES.ADULTS && (
                    <Badge className="flex items-center gap-1 rounded-full bg-rose-300 px-2 py-0">
                      <span className="z-10 text-lg">🔞</span>
                      <span className="text-sm">Adults Only</span>
                    </Badge>
                  )}
                  {session.ages === SESSION_AGES.KIDS && (
                    <Badge className="z-10 rounded-full bg-blue-600 px-2 py-0.5 text-base">
                      🐥
                      <span className="text-gray-100">Kid Friendly</span>
                    </Badge>
                  )}
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
                      userLoggedIn={!!currentUser}
                    />
                  </div>
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
