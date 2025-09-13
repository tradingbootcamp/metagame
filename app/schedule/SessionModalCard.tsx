'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { AddEventModal } from './EditEventModal'
import { HostListLinks } from './HostListLinks'
import { AttendanceDisplay } from './RSVPList'
import { sessionLink } from './scheduleUtils'
import {
  CheckIcon,
  EditIcon,
  ExpandIcon,
  LinkIcon,
  StarIcon,
  XIcon,
} from 'lucide-react'

import { dateUtils } from '@/utils/dateUtils'
import { SESSION_AGES } from '@/utils/dbUtils'

import AddToCalendar from '@/components/AddToCalendar'
import { SessionTitle } from '@/components/SessionTitle'
import { Badge } from '@/components/ui/badge'

import CampusMap from '@/app/campus/components/CampusMap'

import { useScheduleStuff } from '@/hooks/schedule/useScheduleStuff'
import { useUser } from '@/hooks/useUser'
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
  const [showExpandedMap, setShowExpandedMap] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mapTransform, setMapTransform] = useState({ scale: 1, x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if device is desktop (has mouse)
    setIsDesktop(
      window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    )
  }, [])

  const handleWheel = (e: React.WheelEvent) => {
    if (!isDesktop) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1

    setMapTransform((prev) => {
      const newScale = Math.min(Math.max(prev.scale * delta, 0.8), 3)
      return {
        ...prev,
        scale: newScale,
      }
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDesktop) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - mapTransform.x,
      y: e.clientY - mapTransform.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDesktop || !isDragging) return
    e.preventDefault()
    setMapTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }))
  }

  const handleMouseUp = () => {
    if (!isDesktop) return
    setIsDragging(false)
  }

  const resetMapTransform = () => {
    setMapTransform({ scale: 1, x: 0, y: 0 })
  }

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
    const fullUrl = sessionLink(session.id)
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
            <HostListLinks session={session} className="text-sm" />
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
            <div className="flex items-center gap-4 font-medium text-secondary-300">
              <span>📅 {dateUtils.getStringDate(session.start_time)}</span>
              <AddToCalendar session={session} />
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

        {/* Megagame Location */}
        {session.megagame_location && (
          <div className="text-secondary-300">
            This subgame is for control of{' '}
            <span className="font-bold">{session.megagame_location.name}</span>
          </div>
        )}

        {/* Admins and Hosts: Session Needs */}
        {currentUserProfile &&
          (currentUserProfile.is_admin ||
            [session.host_1_id, session.host_2_id, session.host_3_id].includes(
              currentUserProfile.id,
            )) &&
          session.needs && (
            <div className="mt-2 space-y-1 text-pink-500">
              <div className="text-sm font-semibold">Session Needs:</div>
              <div className="text-sm whitespace-pre-wrap">{session.needs}</div>
            </div>
          )}

        {/* Location and Attendance */}
        <div className="flex w-full justify-between gap-1">
          <div className="text-secondary-300">
            This event is located at:{' '}
            <span className="font-bold">
              {' '}
              {session.location?.name || 'TBD'}
            </span>
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

        {/* Campus Map */}
        {session.location?.map_info && (
          <div className="space-y-2">
            <div className="relative">
              <CampusMap
                highlightLocation={session.location?.id || undefined}
                showBuildingNames={true}
                showLocationNames={true}
                showLocationDescription={true}
                showMegagame={false}
                showMegagameElements={false}
                showMegagameColor={false}
                cropped={true}
                textScale={1.7}
              />
              <button
                onClick={() => setShowExpandedMap(true)}
                className="absolute top-2 right-2 rounded-md bg-dark-500/80 p-2 transition-colors hover:bg-dark-400/90"
                title="Expand map"
              >
                <ExpandIcon className="size-4 text-secondary-300" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AddEventModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        existingSessionId={session.id}
        canEdit={canEdit}
      />

      {/* Expanded Map Modal - rendered via portal to cover entire screen */}
      {mounted &&
        showExpandedMap &&
        createPortal(
          <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md ${isDesktop ? 'cursor-grab active:cursor-grabbing' : ''}`}
            onWheel={isDesktop ? handleWheel : undefined}
            onMouseDown={isDesktop ? handleMouseDown : undefined}
            onMouseMove={isDesktop ? handleMouseMove : undefined}
            onMouseUp={isDesktop ? handleMouseUp : undefined}
            onMouseLeave={isDesktop ? handleMouseUp : undefined}
          >
            <div
              className={`relative h-full w-full bg-dark-700 ${isDesktop ? 'overflow-hidden' : 'overflow-auto'}`}
            >
              <button
                onClick={() => setShowExpandedMap(false)}
                className="absolute top-6 right-6 z-10 rounded-md bg-dark-500/90 p-3 shadow-lg transition-colors hover:bg-dark-400"
                title="Close expanded map"
              >
                <XIcon className="size-6 text-white" />
              </button>

              {isDesktop && (
                <button
                  onClick={resetMapTransform}
                  className="absolute top-6 left-6 z-10 rounded-md bg-dark-500/90 p-3 text-sm text-white shadow-lg transition-colors hover:bg-dark-400"
                  title="Reset zoom and position"
                >
                  Reset View
                </button>
              )}

              <div
                className="flex h-full w-full items-center justify-center p-6"
                style={
                  isDesktop
                    ? {
                        transform: `translate(${mapTransform.x}px, ${mapTransform.y}px) scale(${mapTransform.scale})`,
                        transformOrigin: 'center center',
                        transition: isDragging
                          ? 'none'
                          : 'transform 0.1s ease-out',
                      }
                    : {}
                }
              >
                <CampusMap
                  highlightLocation={session.location?.id || undefined}
                  showBuildingNames={true}
                  showLocationNames={true}
                  showLocationDescription={true}
                  showMegagame={false}
                  showMegagameElements={false}
                  showMegagameColor={false}
                  cropped={false}
                  textScale={2.5}
                  disableInteractions={!isDesktop}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
