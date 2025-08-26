'use client'

import { useEffect, useMemo, useState } from 'react'

import { AddEventModal } from './EditEventModal'
import SessionDetailsCard from './SessionModalCard'
import { SessionTooltip } from './SessionTooltip'
import {
  fetchAllRsvps,
  fetchCurrentUserSessionBookmarks,
  fetchLocations,
  fetchSessions,
} from './queries'
import { useQuery } from '@tanstack/react-query'
import {
  CheckIcon,
  ChevronLeft,
  ChevronRight,
  FilterIcon,
  PlusIcon,
  StarIcon,
  User2Icon,
  UserIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'

import { dateUtils } from '@/utils/dateUtils'
import {
  SESSION_AGES,
  countRsvpsByTeamColor,
  dbGetHostsFromSession,
} from '@/utils/dbUtils'

import { BloodDrippingFrame } from '@/components/BloodDrippingFrame'
import { Modal } from '@/components/Modal'
import { SessionTitle } from '@/components/SessionTitle'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { useUser } from '@/hooks/dbQueries'
import {
  DbProfile,
  DbSessionRsvpWithTeam,
  DbSessionView,
} from '@/types/database/dbTypeAliases'

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

// Color options for events
const locationEventColors = [
  'bg-blue-200 border-blue-300',
  'bg-purple-200 border-purple-300',
  'bg-orange-200 border-orange-300',
  'bg-cyan-100 border-cyan-200',
  'bg-pink-200 border-pink-300',
  'bg-yellow-200 border-yellow-300',
  'bg-red-200 border-red-300',
  'bg-indigo-200 border-indigo-300',
  'bg-teal-200 border-teal-300',
]

const locationEventRSVPdColors = [
  'bg-blue-500 border-blue-600',
  'bg-purple-500 border-purple-600',
  'bg-orange-500 border-orange-600',
  'bg-cyan-400 border-cyan-500',
  'bg-pink-500 border-pink-600',
  'bg-yellow-500 border-yellow-600',
  'bg-red-500 border-red-600',
  'bg-indigo-500 border-indigo-600',
  'bg-teal-500 border-teal-600',
]

// Updated slot checking - PST based
const eventStartsInSlot = (session: DbSessionView, slotTime: string) => {
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
const getEventOffsetMinutes = (session: DbSessionView, slotTime: string) => {
  if (!session.start_time) return 0

  const sessionStartMinutes = dateUtils.getPSTMinutes(session.start_time)
  const [slotHour, slotMinute] = slotTime.split(':').map(Number)
  const slotStartMinutes = slotHour * 60 + slotMinute

  return Math.max(0, sessionStartMinutes - slotStartMinutes)
}

// Updated duration calculation - PST based
const getEventDurationMinutes = (session: DbSessionView) => {
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
  const { currentUserProfile } = useUser()

  // Use queries to fetch data
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
  })

  const { data: allLocations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  })

  const { data: currentUserBookmarks = [] } = useQuery({
    queryKey: ['bookmarks', 'current-user'],
    queryFn: fetchCurrentUserSessionBookmarks,
  })

  const { data: allRsvps = [] } = useQuery({
    queryKey: ['rsvps'],
    queryFn: () => {
      console.log('refetching rsvps')
      return fetchAllRsvps()
    },
  })
  const currentUserRsvps = useMemo(() => {
    return allRsvps.filter((rsvp) => rsvp.user_id === currentUserProfile?.id)
  }, [allRsvps, currentUserProfile])

  // Filter and sort locations for schedule display
  const locations = useMemo(() => {
    return allLocations
      .filter((location) => location.display_in_schedule) // Only show locations that should be displayed in schedule
      .sort((a, b) => a.schedule_display_order - b.schedule_display_order) // Sort by display order
  }, [allLocations])

  const [filterForUserEvents, setFilterForUserEvents] = useState(false)
  const [filterForBookmarkedEvents, setFilterForBookmarkedEvents] =
    useState(false)

  // Group sessions by the 3 fixed conference days
  const days = useMemo(() => {
    const dayEvents = [
      [], // Day 0: Friday 9/12
      [], // Day 1: Saturday 9/13
      [], // Day 2: Sunday 9/14
    ] as DbSessionView[][]

    const filterSessionForUser = (session: DbSessionView) => {
      if (!currentUserProfile) return true
      if (currentUserRsvps.some((rsvp) => rsvp.session_id === session.id!)) {
        return true
      }
      const sessionHostIds = [
        session.host_1_id,
        session.host_2_id,
        session.host_3_id,
      ].filter(Boolean)
      return sessionHostIds.some((hostId) => currentUserProfile?.id === hostId)
    }
    const maybeFilteredSessions = filterForUserEvents
      ? sessions.filter(filterSessionForUser)
      : sessions
    const maybeFurtherFilteredSessions = filterForBookmarkedEvents
      ? maybeFilteredSessions.filter((session) =>
          currentUserBookmarks.some(
            (bookmark) => bookmark.session_id === session.id!,
          ),
        )
      : maybeFilteredSessions
    maybeFurtherFilteredSessions.forEach((session) => {
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
      events: dayEvents[index].sort((a, b) =>
        (a.start_time || '').localeCompare(b.start_time || ''),
      ),
    }))
  }, [sessions, filterForUserEvents, filterForBookmarkedEvents])
  const [currentDayIndex, setCurrentDayIndex] = useState(dayIndex ?? 0)
  const [openedSessionId, setOpenedSessionId] = useState<
    DbSessionView['id'] | null
  >(sessionId ?? null)
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)
  const [addEventPrefill, setAddEventPrefill] = useState<{
    startTime: string
    locationId: string
  } | null>(null)

  // Sync URL parameters with state changes
  useEffect(() => {
    if (!pathname.startsWith('/schedule')) return
    const params = new URLSearchParams()
    if (currentDayIndex !== 0) params.set('day', currentDayIndex.toString())
    if (openedSessionId) params.set('session', openedSessionId)

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
  const handleToggleFilterForBookmarkedEvents = () => {
    setFilterForBookmarkedEvents((prev) => {
      const newFilter = !prev
      toast.info(
        `${newFilter ? 'Now' : 'No longer'} filtering for your starred sessions`,
      )
      return newFilter
    })
  }
  const handleToggleFilterForUserEvents = () => {
    setFilterForUserEvents((prev) => {
      const newFilter = !prev
      toast.info(
        `${newFilter ? 'Now' : 'No longer'} filtering for your hosted/rsvp'd sessions`,
      )
      return newFilter
    })
  }
  // Helper function to get event color
  const getEventColor = (session: DbSessionView) => {
    const userIsRsvpd = currentUserRsvps.some(
      (rsvp) => rsvp.session_id === session.id!,
    )
    if (session.megagame) {
      return userIsRsvpd
        ? 'bg-[repeating-linear-gradient(45deg,#f97316,#f97316_10px,#a855f7_10px,#a855f7_20px)]'
        : 'bg-[repeating-linear-gradient(45deg,#fb923c,#fb923c_10px,#c084fc_10px,#c084fc_20px)]'
    }
    const locationIndex = locations.findIndex(
      (l) => l.id === session.location_id,
    )
    return userIsRsvpd
      ? locationEventRSVPdColors[
          locationIndex % locationEventRSVPdColors.length
        ]
      : locationEventColors[locationIndex % locationEventColors.length]
  }

  return (
    <div className="bg-dark-500 flex flex-col rounded-2xl font-serif">
      {/* Day Navigator - Fixed on desktop, scrollable on mobile */}
      <div className="bg-dark-600 border-secondary-300 hidden flex-shrink-0 items-center justify-between border-b p-4 lg:flex">
        <button
          onClick={prevDay}
          className="cursor-pointer rounded-md p-2 transition-colors disabled:opacity-50"
          disabled={currentDayIndex === 0}
        >
          <ChevronLeft className="text-secondary-300 h-5 w-5" />
        </button>

        <h2 className="text-secondary-200 text-center text-xl font-bold">
          {currentDay.displayName}
        </h2>

        <button
          onClick={nextDay}
          className="cursor-pointer rounded-md p-2 transition-colors disabled:opacity-50"
          disabled={currentDayIndex === days.length - 1}
        >
          <ChevronRight className="text-secondary-300 h-5 w-5" />
        </button>
      </div>

      {/* Scrollable Schedule Content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {/* Day Navigator - Mobile only, inside scrollable area, sticky left */}
        <div className="bg-dark-600 border-secondary-300 sticky left-0 z-30 flex items-center justify-between border-b p-4 lg:hidden">
          <button
            onClick={prevDay}
            className="rounded-md p-2 transition-colors disabled:opacity-50"
            disabled={currentDayIndex === 0}
          >
            <ChevronLeft className="text-secondary-300 h-5 w-5" />
          </button>

          <h2 className="text-secondary-200 text-center text-xl font-bold">
            {currentDay.displayName}
          </h2>

          <button
            onClick={nextDay}
            className="rounded-md p-2 transition-colors disabled:opacity-50"
            disabled={currentDayIndex === days.length - 1}
          >
            <ChevronRight className="text-secondary-300 h-5 w-5" />
          </button>
        </div>

        <div className="h-fit min-w-fit">
          {/* Images Row - Scrollable on mobile, sticky on large */}
          <div
            className="bg-dark-400 grid lg:top-0 lg:z-30"
            style={{
              gridTemplateColumns: `60px repeat(${locations.length}, minmax(180px, 1fr))`,
            }}
          >
            <div className="bg-dark-600 border-secondary-300 sticky left-0 z-30 border p-3">
              {/* Empty space above time column */}
            </div>
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-dark-600 border-secondary-300 border p-3"
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
                      <div className="bg-dark-500 h-24 w-full" />
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
                  <div className="bg-dark-500 h-24 w-full" />
                )}
              </div>
            ))}
          </div>

          {/* Names Row - Always sticky, with day nav on mobile */}
          <div
            className="bg-dark-400 sticky top-0 z-20 grid"
            style={{
              gridTemplateColumns: `60px repeat(${locations.length}, minmax(180px, 1fr))`,
            }}
          >
            <div className="bg-dark-600 border-secondary-300 sticky top-0 left-0 z-30 border border-b-2 p-3">
              <div className="text-secondary-300 sticky flex flex-col gap-4 size-full items-center justify-center text-sm font-medium">
                {currentUserProfile?.id && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`${filterForUserEvents ? 'opacity-100' : 'opacity-50'} hover:bg-dark-300 cursor-pointer rounded-sm  transition-colors`}
                        onClick={handleToggleFilterForUserEvents}
                      >
                        <FilterIcon className="text-secondary-300 size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Filter for hosted/RSVP&apos;d sessions
                    </TooltipContent>
                  </Tooltip>
                )}
                {currentUserProfile?.id && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`${filterForBookmarkedEvents ? 'opacity-100' : 'opacity-50'} hover:bg-dark-300 cursor-pointer rounded-sm  transition-colors`}
                        onClick={handleToggleFilterForBookmarkedEvents}
                      >
                        <StarIcon
                          fill={filterForBookmarkedEvents ? 'yellow' : 'none'}
                          className="text-secondary-300 size-4"
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Filter for starred sessions</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            {locations.map((venue) => (
              <div
                key={venue.id}
                className="bg-dark-600 border-secondary-300 border border-b-2 p-3"
              >
                <div className="text-secondary-200 flex size-full flex-col items-start justify-start">
                  <span className="font-serif text-base font-bold">
                    {venue.name}
                  </span>
                  {venue.campus_location && (
                    <span className="text-secondary-400 font-sans text-xs font-normal">
                      {venue.campus_location}
                    </span>
                  )}
                  {venue.capacity && (
                    <span className="text-secondary-400 flex items-center gap-1 font-sans text-xs font-normal">
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
            className="bg-dark-400 grid"
            style={{
              gridTemplateColumns: `60px repeat(${locations.length}, minmax(180px, 1fr))`,
            }}
          >
            {generateTimeSlots(currentDayIndex).map((time) => (
              <div key={time} className="contents">
                {/* Time Cell - Sticky Left */}
                <div className="bg-dark-500 border-r-secondary-300 border-dark-400 z-sticky sticky top-0 left-0 flex w-full justify-center border">
                  <div className="text-secondary-300 text-sm font-medium">
                    {time}
                  </div>
                </div>

                {/* Venue Cells */}
                {locations.map((venue) => {
                  const eventsInSlot = currentDay.events.filter(
                    (session) =>
                      session.location_id === venue.id &&
                      eventStartsInSlot(session, time),
                  )
                  return (
                    <div
                      key={venue.id}
                      className="bg-dark-500 border-dark-400 relative min-h-[60px] overflow-visible border"
                    >
                      {eventsInSlot.map((session) => (
                        <SessionTooltip
                          key={session.id}
                          tooltip={
                            <SessionDetailsCard
                              session={session}
                              canEdit={editPermissions[session.id!] || false}
                            />
                          }
                        >
                          <div
                            onClick={() => handleOpenSessionModal(session.id!)}
                            className={`z-content absolute m-0.5 rounded-md border-2 p-1 ${getEventColor(session)} font-semibold text-black`}
                            style={{
                              top: `${getEventOffsetMinutes(session, time) * 2}px`, // 2px per minute
                              height: `${getEventDurationMinutes(session) * 2}px`, // 2px per minute
                              left: '0px',
                              right: '0px',
                            }}
                          >
                            <div className="relative flex size-full flex-col">
                              <div className="text-sm leading-tight font-bold">
                                <SessionTitle title={session.title} />
                              </div>
                              <div className="font-sans text-xs">
                                {dbGetHostsFromSession(session).join(', ')}
                              </div>
                              <div className="absolute left-0 bottom-0 flex items-center gap-1 font-sans text-xs opacity-80">
                                {currentUserBookmarks.some(
                                  (bookmark) =>
                                    bookmark.session_id === session.id!,
                                ) && <StarIcon className="size-3" />}
                              </div>
                              <div className="absolute right-0 bottom-0">
                                <div className="flex flex-col items-end gap-0.5">
                                  <div className="flex items-center gap-1 font-sans text-xs opacity-80">
                                    {session.ages === SESSION_AGES.ADULTS && (
                                      <Tooltip clickable>
                                        <TooltipTrigger>
                                          <span className="text-lg z-10">
                                            🔞
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Adults only</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    {session.ages === SESSION_AGES.KIDS && (
                                      <Tooltip clickable>
                                        <TooltipTrigger>
                                          <Badge className=" bg-blue-600 text-base z-10 rounded-full p-0.5 aspect-square">
                                            🐥
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Kid friendly</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    {currentUserRsvps.some(
                                      (rsvp) => rsvp.session_id === session.id!,
                                    ) && (
                                      <CheckIcon
                                        className="size-4 rounded-full bg-white p-0.5 text-green-600"
                                        strokeWidth={3}
                                      />
                                    )}
                                    <UserIcon className="size-3" />
                                    <AttendanceDisplay
                                      session={session}
                                      sessionRsvps={allRsvps.filter(
                                        (rsvp) =>
                                          rsvp.session_id === session.id!,
                                      )}
                                      currentUserProfile={
                                        currentUserProfile ?? null
                                      }
                                    />
                                  </div>
                                </div>
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
                            className="hover:bg-dark-400 hover:bg-opacity-20 group absolute inset-0 cursor-pointer transition-colors duration-200"
                            title={`Add event at ${time} in ${venue.name}`}
                          >
                            <div className="text-secondary-400 hidden h-full items-center justify-center text-xs group-hover:flex">
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

      {openedSessionId && (
        <Modal
          onClose={() => {
            const sessionDayIndex = days.findIndex((day) =>
              day.events.some((event) => event.id === openedSessionId),
            )
            setOpenedSessionId(null)
            if (sessionDayIndex >= 0) {
              setCurrentDayIndex(sessionDayIndex)
            }
          }}
        >
          <SessionDetailsCard
            session={sessions.find((s) => s.id === openedSessionId)!}
            canEdit={editPermissions[openedSessionId!] || false}
          />
        </Modal>
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
          className="bg-primary-500 hover:bg-primary-600 fixed right-6 bottom-6 z-[9999] rounded-full p-3 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
          title="Add new event"
          onClick={() => setIsAddEventModalOpen(true)}
        >
          <PlusIcon className="size-5" />
        </button>
      )}
    </div>
  )
}

export const AttendanceDisplay = ({
  session,
  sessionRsvps,
  currentUserProfile,
}: {
  session: DbSessionView
  sessionRsvps: DbSessionRsvpWithTeam[]
  currentUserProfile: DbProfile | null
}) => {
  const teamCounts = countRsvpsByTeamColor(sessionRsvps)
  if (!currentUserProfile) {
    return (
      <div>
        {session.min_capacity && session.max_capacity
          ? `${session.min_capacity} 
        - ${session.max_capacity}`
          : null}
      </div>
    )
  }
  if (session.megagame) {
    return (
      <div className="flex items-center gap-1 font-sans text-xs bg-gray-200 rounded-md px-1 py-0.5">
        <span className="text-purple-500 font-bold">{teamCounts.purple}</span>
        <span className="text-black font-bold">|</span>
        <span className="text-orange-400 font-bold">{teamCounts.orange}</span>
      </div>
    )
  }
  return (
    <span>
      {session.max_capacity
        ? `${session.rsvp_count ?? '0'} / ${session.max_capacity}`
        : `${session.rsvp_count ?? '0'}`}
    </span>
  )
}
