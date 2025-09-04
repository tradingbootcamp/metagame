'use client'

import { useEffect, useMemo, useState } from 'react'

import { AddEventModal } from './EditEventModal'
import { AttendanceDisplay } from './RSVPList'
import SessionDetailsCard from './SessionModalCard'
import { SessionTooltip } from './SessionTooltip'
import { scheduleColors } from './scheduleColors'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  PlusIcon,
  StarIcon,
  User2Icon,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'

import { dateUtils } from '@/utils/dateUtils'
import {
  SESSION_AGES,
  SESSION_CATEGORIES,
  // countRsvpsByTeamColor,
  dbGetHostsFromSession,
} from '@/utils/dbUtils'

import { BloodDrippingFrame } from '@/components/BloodDrippingFrame'
import { SessionTitle } from '@/components/SessionTitle'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { useUser } from '@/hooks/dbQueries'
import { useScheduleStuff } from '@/hooks/useScheduleStuff'
import { DbFullSession } from '@/types/database/dbTypeAliases'

const SCHEDULE_START_TIMES = [14, 9, 9]
const SCHEDULE_END_TIMES = [22, 22, 22]
// Fixed conference days - create Date objects representing midnight in Pacific Time
export const CONFERENCE_DAYS = [
  { date: new Date('2025-09-12T00:00:00-07:00'), name: 'Friday' },
  { date: new Date('2025-09-13T00:00:00-07:00'), name: 'Saturday' },
  { date: new Date('2025-09-14T00:00:00-07:00'), name: 'Sunday' },
]

// Generate time slots from 9:00 to 22:00 in 30-minute intervals
const generateTimeSlots = (dayIndex: number) => {
  const slots = []
  for (
    let hour = SCHEDULE_START_TIMES[dayIndex];
    hour <= SCHEDULE_END_TIMES[dayIndex];
    hour++
  ) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < SCHEDULE_END_TIMES[dayIndex]) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  return slots
}

// Updated slot checking - PST based
const eventStartsInSlot = (session: DbFullSession, slotTime: string) => {
  if (!session.start_time) return false

  const sessionStartMinutes = dateUtils.getPSTMinutes(session.start_time)
  const [slotHour, slotMinute] = slotTime.split(':').map(Number)
  const slotStartMinutes = slotHour * 60 + slotMinute
  const slotEndMinutes = slotStartMinutes + 30

  return (
    sessionStartMinutes >= slotStartMinutes &&
    sessionStartMinutes < slotEndMinutes
  )
}

// Updated offset calculation - PST based
const getEventOffsetMinutes = (session: DbFullSession, slotTime: string) => {
  if (!session.start_time) return 0

  const sessionStartMinutes = dateUtils.getPSTMinutes(session.start_time)
  const [slotHour, slotMinute] = slotTime.split(':').map(Number)
  const slotStartMinutes = slotHour * 60 + slotMinute

  return Math.max(0, sessionStartMinutes - slotStartMinutes)
}

// Updated duration calculation - PST based
const getEventDurationMinutes = (session: DbFullSession) => {
  if (!session.start_time || !session.end_time) return 30

  const startMinutes = dateUtils.getPSTMinutes(session.start_time)
  const endMinutes = dateUtils.getPSTMinutes(session.end_time)
  return endMinutes - startMinutes
}

export default function Schedule({
  sessionId,
  dayIndex,
  editPermissions,
}: {
  sessionId?: string
  dayIndex?: number
  editPermissions: Record<string, boolean>
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUserProfile, currentUser } = useUser()
  const {
    isUserRsvpd,
    toggleRsvp,
    isSessionBookmarked,
    toggleBookmark,
    bookmarks,
    locations,
    sessions,
  } = useScheduleStuff()

  // Filter and sort locations for schedule display
  const scheduleLocations = useMemo(() => {
    return locations
      .filter((location) => location.display_in_schedule) // Only show locations that should be displayed in schedule
      .sort((a, b) => a.schedule_display_order - b.schedule_display_order) // Sort by display order
  }, [locations])

  const [filterForUserEvents, setFilterForUserEvents] = useState(false)

  // Group sessions by the 3 fixed conference days
  const days = useMemo(() => {
    const dayEvents = [
      [], // Day 0: Friday 9/12
      [], // Day 1: Saturday 9/13
      [], // Day 2: Sunday 9/14
    ] as DbFullSession[][]

    const userRsvpOrHostingSession = (session: DbFullSession) => {
      if (!currentUserProfile) return true
      if (isUserRsvpd(session.id!)) {
        return true
      }
      const sessionHostIds = [
        session.host_1_id,
        session.host_2_id,
        session.host_3_id,
      ].filter(Boolean)
      return sessionHostIds.some((hostId) => currentUserProfile?.id === hostId)
    }
    const filteredSessions = filterForUserEvents
      ? sessions.filter(
          (session) =>
            userRsvpOrHostingSession(session) ||
            isSessionBookmarked(session.id!),
        )
      : sessions
    filteredSessions.forEach((session) => {
      const [sessionStart, sessionEnd] = [
        session.start_time,
        session.end_time,
      ].filter(Boolean)
      if (!sessionStart || !sessionEnd || !session.title) return

      const dayIndex = CONFERENCE_DAYS.findIndex((day) => {
        if (
          dateUtils.getPacificParts(day.date).day ===
          dateUtils.getPacificParts(new Date(sessionStart)).day
        ) {
          return true
        }
        return false
      })
      if (dayIndex >= 0) {
        dayEvents[dayIndex].push(session)
      }
    })

    // Create the final days array
    return CONFERENCE_DAYS.map((confDay, index) => ({
      date: confDay.date,
      displayName: `${confDay.name} (${dateUtils.getYYYYMMDD(confDay.date)})`,
      shortDateDisplayName: `${confDay.name} (${dateUtils.getYYYYMMDD(confDay.date).slice(5)})`,
      shortName: confDay.name,
      events: dayEvents[index].sort((a, b) =>
        (a.start_time || '').localeCompare(b.start_time || ''),
      ),
    }))
  }, [sessions, filterForUserEvents, bookmarks])
  const [currentDayIndex, setCurrentDayIndex] = useState(dayIndex ?? 0)
  const [openedSessionId, setOpenedSessionId] = useState<
    DbFullSession['id'] | null
  >(sessionId ?? null)
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)
  const [addEventPrefill, setAddEventPrefill] = useState<{
    startTime: string
    locationId: string
  } | null>(null)

  const openedSession = useMemo(() => {
    return sessions.find((s) => s.id === openedSessionId) ?? null
  }, [sessions, openedSessionId])

  // Sync URL parameters with state changes
  useEffect(() => {
    if (!pathname.startsWith('/schedule')) return
    const params = new URLSearchParams()
    if (currentDayIndex !== 0) params.set('day', currentDayIndex.toString())
    if (openedSessionId) params.set('session', openedSessionId)
    if (!openedSessionId) params.delete('session')

    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [currentDayIndex, openedSessionId, router])

  const currentDay = days[currentDayIndex] || {
    date: '',
    displayName: 'No Events',
    events: [],
  }

  const nextDay = () => {
    setCurrentDayIndex((prev) => Math.min(days.length - 1, prev + 1))
  }

  const prevDay = () => {
    setCurrentDayIndex((prev) => Math.max(0, prev - 1))
  }

  const handleOpenSessionModal = (sessionId: string) => {
    setOpenedSessionId(sessionId)
  }

  const handleEmptySlotClick = (time: string, locationId: string) => {
    if (!currentUserProfile?.is_admin) return

    setAddEventPrefill({
      startTime: time,
      locationId: locationId,
    })
    setIsAddEventModalOpen(true)
  }

  const handleToggleFilterForUserEvents = () => {
    setFilterForUserEvents((prev) => {
      const newFilter = !prev
      toast.info(
        `${newFilter ? 'Now' : 'No longer'} filtering to only show sessions you have starred or are attending or hosting.`,
        {
          duration: 5000,
        },
      )
      return newFilter
    })
  }

  // Helper function to get event color based on session properties
  const getEventColor = (session: DbFullSession) => {
    const userIsRsvpd = isUserRsvpd(session.id!) ? 'rsvpd' : 'notRsvpd'
    // Switch based on session properties for specific styling
    switch (true) {
      // Megagames get special striped pattern
      case session.megagame:
        return scheduleColors[userIsRsvpd].megagame

      // Kids sessions get yellow background
      case session.ages === SESSION_AGES.KIDS:
        return scheduleColors[userIsRsvpd].kids

      // Categories have colors
      case !!session.category:
        return scheduleColors[userIsRsvpd].category[session.category]

      // Default: location-based coloring
      default:
        return scheduleColors[userIsRsvpd].category[SESSION_CATEGORIES.OTHER]
    }
  }

  return (
    <div className="flex flex-col rounded-2xl bg-dark-500 font-serif">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-secondary-300 bg-dark-600 p-4">
        <button
          onClick={prevDay}
          className="group flex cursor-pointer items-center gap-2 justify-self-start rounded-md p-2 transition-colors disabled:opacity-50"
          disabled={currentDayIndex === 0}
        >
          <ArrowLeftIcon className="h-5 w-5 text-secondary-300" />
          {currentDayIndex > 0 && (
            <span className="text-lg font-semibold text-secondary-200 opacity-50 group-hover:opacity-100">
              <span className="hidden sm:block">
                {days[currentDayIndex - 1].shortName}
              </span>
              <span className="block sm:hidden">
                {days[currentDayIndex - 1].shortName.slice(0, 3)}
              </span>
            </span>
          )}
        </button>

        <h2 className="justify-self-center text-center text-xl font-bold text-secondary-200">
          <span className="hidden sm:block">{currentDay.displayName}</span>
          <div className="flex flex-col items-center justify-center sm:hidden">
            <span className="">{currentDay.shortName}</span>
            <span className="text-xs">
              {dateUtils.getYYYYMMDD(currentDay.date)}
            </span>
          </div>
        </h2>

        <button
          onClick={nextDay}
          className="group flex cursor-pointer items-center gap-2 justify-self-end rounded-md p-2 transition-colors disabled:opacity-50"
          disabled={currentDayIndex === days.length - 1}
        >
          {currentDayIndex < days.length - 1 && (
            <span className="text-lg font-semibold text-secondary-200 opacity-50 group-hover:opacity-100">
              <span className="hidden sm:block">
                {days[currentDayIndex + 1].shortName}
              </span>
              <span className="block sm:hidden">
                {days[currentDayIndex + 1].shortName.slice(0, 3)}
              </span>
            </span>
          )}
          <ArrowRightIcon className="h-5 w-5 text-secondary-300" />
        </button>
      </div>

      {/* Scrollable Schedule Content */}
      <div className="no-scrollbar flex-1 overflow-x-auto overflow-y-hidden">
        <div className="h-fit min-w-fit">
          {/* Images Row - Scrollable on mobile, sticky on large */}
          <div
            className="grid bg-dark-400 lg:top-0 lg:z-30"
            style={{
              gridTemplateColumns: `60px repeat(${scheduleLocations.length}, minmax(180px, 1fr))`,
            }}
          >
            <div className="sticky left-0 z-30 border border-secondary-300 bg-dark-600 p-3">
              {/* Empty space above time column */}
            </div>
            {scheduleLocations.map((location) => (
              <div
                key={location.id}
                className="border border-secondary-300 bg-dark-600 p-3"
              >
                {location.name === 'The Clocktower' ? (
                  <BloodDrippingFrame className="z-1 h-24 w-full">
                    {location.thumbnail_url ? (
                      <Image
                        src={location.thumbnail_url}
                        alt={location.name}
                        width={100}
                        height={100}
                        className="h-24 w-full object-cover"
                      />
                    ) : (
                      <div className="h-24 w-full bg-dark-500" />
                    )}
                  </BloodDrippingFrame>
                ) : location.thumbnail_url ? (
                  <Image
                    src={location.thumbnail_url}
                    alt={location.name}
                    width={100}
                    height={100}
                    className="h-24 w-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-full bg-dark-500" />
                )}
              </div>
            ))}
          </div>

          {/* Names Row - Always sticky, with day nav on mobile */}
          <div
            className="sticky top-0 z-20 grid bg-dark-400"
            style={{
              gridTemplateColumns: `60px repeat(${scheduleLocations.length}, minmax(180px, 1fr))`,
            }}
          >
            <div className="sticky top-0 left-0 z-30 border border-b-2 border-secondary-300 bg-dark-600 p-3">
              <div className="sticky flex size-full flex-col items-center justify-center gap-4 text-sm font-medium text-secondary-300">
                {currentUserProfile?.id && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`${filterForUserEvents ? 'opacity-100' : 'opacity-50'} cursor-pointer rounded-sm transition-colors hover:bg-dark-300`}
                        onClick={handleToggleFilterForUserEvents}
                      >
                        <StarIcon
                          fill={filterForUserEvents ? 'yellow' : 'none'}
                          className="size-4 text-secondary-300"
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Filter for your sessions</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            {scheduleLocations.map((venue) => (
              <div
                key={venue.id}
                className="border border-b-2 border-secondary-300 bg-dark-600 p-3"
              >
                <div className="flex size-full flex-col items-start justify-start text-secondary-200">
                  <span className="font-serif text-base font-bold">
                    {venue.name}
                  </span>
                  {venue.campus_location && (
                    <span className="font-sans text-xs font-normal text-secondary-400">
                      {venue.campus_location}
                    </span>
                  )}
                  {venue.capacity && (
                    <span className="flex items-center gap-1 font-sans text-xs font-normal text-secondary-400">
                      Max {venue.capacity}
                      <User2Icon className="size-3" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          <div
            className="grid bg-dark-400"
            style={{
              gridTemplateColumns: `60px repeat(${scheduleLocations.length}, minmax(180px, 1fr))`,
            }}
          >
            {generateTimeSlots(currentDayIndex).map((time) => (
              <div key={time} className="contents">
                {/* Time Cell - Sticky Left */}
                <div className="sticky top-0 left-0 z-sticky flex w-full justify-center border border-dark-400 border-r-secondary-300 bg-dark-500">
                  <div className="text-sm font-medium text-secondary-300">
                    {time}
                  </div>
                </div>

                {/* Venue Cells */}
                {scheduleLocations.map((venue) => {
                  const eventsInSlot = currentDay.events.filter(
                    (session) =>
                      session.location_id === venue.id &&
                      eventStartsInSlot(session, time),
                  )
                  return (
                    <div
                      key={venue.id}
                      className="relative min-h-[60px] overflow-visible border border-dark-400 bg-dark-500"
                    >
                      {eventsInSlot.map((session) => (
                        <SessionTooltip
                          key={session.id}
                          tooltip={
                            <SessionDetailsCard
                              session={session}
                              canEdit={false}
                              showButtons={false}
                            />
                          }
                        >
                          <div
                            onClick={() => handleOpenSessionModal(session.id!)}
                            className={`group absolute z-content m-0.5 rounded-md border-2 p-1 ${getEventColor(session)} font-semibold text-black`}
                            style={{
                              top: `${getEventOffsetMinutes(session, time) * 2}px`, // 2px per minute
                              height: `${getEventDurationMinutes(session) * 2}px`, // 2px per minute
                              left: '0px',
                              right: '0px',
                              boxShadow: isUserRsvpd(session.id!)
                                ? '0 0 0 3px #ff33be'
                                : undefined,
                            }}
                          >
                            <div className="relative flex size-full flex-col">
                              <div className="text-sm leading-tight font-bold">
                                <SessionTitle title={session.title} />
                              </div>
                              <div className="font-sans text-xs">
                                {dbGetHostsFromSession(session).join(', ')}
                              </div>
                              {currentUser && (
                                <div className="absolute bottom-0 left-0 flex min-h-[20px] items-center gap-1 font-sans text-xs opacity-80">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleBookmark(session.id!)
                                    }}
                                    className="rounded-xs p-0.5 hover:cursor-pointer"
                                  >
                                    <StarIcon
                                      fill={
                                        isSessionBookmarked(session.id!)
                                          ? 'black'
                                          : 'none'
                                      }
                                      strokeWidth={2}
                                      className={`size-3 ${isSessionBookmarked(session.id!) ? 'block' : 'hidden'} text-black group-hover:block`}
                                    />
                                  </button>
                                </div>
                              )}
                              <div className="absolute right-0 bottom-0 flex items-center gap-1 font-sans text-xs opacity-80">
                                <div className="flex min-h-[20px] items-center gap-1">
                                  {currentUser && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleRsvp(session.id!)
                                      }}
                                      className={`hidden cursor-pointer rounded-sm bg-slate-200 p-0.5 font-serif group-hover:block ${isUserRsvpd(session.id!) ? 'text-red-600' : 'text-green-700'}`}
                                    >
                                      {isUserRsvpd(session.id!)
                                        ? 'UnRSVP'
                                        : 'RSVP'}
                                    </button>
                                  )}
                                  {isUserRsvpd(session.id!) && (
                                    <CheckIcon
                                      className="size-4 rounded-full bg-white text-green-600"
                                      strokeWidth={3}
                                    />
                                  )}
                                </div>
                                {session.ages === SESSION_AGES.ADULTS && (
                                  <Tooltip clickable>
                                    <TooltipTrigger>
                                      <span className="z-10 text-lg">🔞</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Adults only</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {session.ages === SESSION_AGES.KIDS && (
                                  <Tooltip clickable>
                                    <TooltipTrigger>
                                      <Badge className="z-10 aspect-square rounded-full bg-blue-600 p-0.5 text-base">
                                        🐥
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Kid friendly</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <AttendanceDisplay
                                  session={session}
                                  userLoggedIn={!!currentUser}
                                />
                              </div>
                            </div>
                          </div>
                        </SessionTooltip>
                      ))}

                      {/* Clickable empty slot for admins */}
                      {currentUserProfile?.is_admin &&
                        eventsInSlot.length === 0 && (
                          <div
                            onClick={() => handleEmptySlotClick(time, venue.id)}
                            className="hover:bg-opacity-20 group absolute inset-0 cursor-pointer transition-colors duration-200 hover:bg-dark-400"
                            title={`Add event at ${time} in ${venue.name}`}
                          >
                            <div className="hidden h-full items-center justify-center text-xs text-secondary-400 group-hover:flex">
                              <PlusIcon className="size-6" />
                            </div>
                          </div>
                        )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {openedSession && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) {
              const sessionDayIndex = days.findIndex((day) =>
                day.events.some((event) => event.id === openedSessionId),
              )
              setOpenedSessionId(null)
              if (sessionDayIndex >= 0) {
                setCurrentDayIndex(sessionDayIndex)
              }
            }
          }}
        >
          <DialogContent
            showCloseButton={false}
            className="rounded-none border-none bg-transparent p-0 shadow-none"
          >
            <DialogTitle className="sr-only">Session Details</DialogTitle>
            <SessionDetailsCard
              session={openedSession}
              canEdit={editPermissions[openedSessionId!] || false}
              showButtons={true}
            />
          </DialogContent>
        </Dialog>
      )}

      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => {
          setIsAddEventModalOpen(false)
          setAddEventPrefill(null)
        }}
        defaultDay={
          dateUtils.getPacificParts(CONFERENCE_DAYS[currentDayIndex]?.date).day
        }
        prefillData={addEventPrefill}
      />

      {/* Floating Action Button - Admin Only - Only on /schedule route */}
      {currentUserProfile?.is_admin && pathname.startsWith('/schedule') && (
        <button
          className="fixed right-6 bottom-6 z-[9999] rounded-full bg-primary-500 p-3 text-white shadow-lg transition-all duration-200 hover:bg-primary-600 hover:shadow-xl"
          title="Add new event"
          onClick={() => setIsAddEventModalOpen(true)}
        >
          <PlusIcon className="size-5" />
        </button>
      )}
    </div>
  )
}
