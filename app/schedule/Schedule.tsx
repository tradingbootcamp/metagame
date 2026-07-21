'use client'

import { useEffect, useMemo, useState } from 'react'

import { AddEventModal } from './EditEventModal'
import { HostListLinks } from './HostListLinks'
import { LocationFilterMenu } from './LocationFilterMenu'
import { AttendanceDisplay } from './RSVPList'
import SessionDetailsCard from './SessionModalCard'
import { SessionTooltip } from './SessionTooltip'
import { scheduleColors } from './scheduleColors'
import { locationSlug } from './scheduleUtils'
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
import { SESSION_AGES, SESSION_CATEGORIES } from '@/utils/dbUtils'

import { BloodDrippingFrame } from '@/components/BloodDrippingFrame'
import { SessionTitle } from '@/components/SessionTitle'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { useScheduleStuff } from '@/hooks/schedule/useScheduleStuff'
import { useUser } from '@/hooks/useUser'
import { DbFullSession } from '@/types/database/dbTypeAliases'

// Baseline display window per day; extended when sessions fall outside it
const DEFAULT_START_HOURS = [14, 9, 9]
const DEFAULT_END_HOURS = [22, 22, 22]
const MINUTES_PER_DAY = 24 * 60
// Fixed conference days - create Date objects representing midnight in Pacific Time
export const CONFERENCE_DAYS = [
  { date: new Date('2025-09-12T00:00:00-07:00'), name: 'Friday' },
  { date: new Date('2025-09-13T00:00:00-07:00'), name: 'Saturday' },
  { date: new Date('2025-09-14T00:00:00-07:00'), name: 'Sunday' },
]

// A session placed on the grid, with its Pacific-midnight-relative position
// computed once instead of per slot x location render
type PlacedSession = {
  session: DbFullSession
  startMinutes: number
  durationMinutes: number
}

// Generate 30-minute slots covering [startHour, endHour]
const generateTimeSlots = (startHour: number, endHour: number) => {
  const slots: string[] = []
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < endHour) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  return slots
}

const slotForMinutes = (minutes: number) => {
  const hour = Math.floor(minutes / 60)
  return `${hour.toString().padStart(2, '0')}:${minutes % 60 >= 30 ? '30' : '00'}`
}

// Default to the conference day in progress (Pacific) when there is one
const getDefaultDayIndex = () => {
  const todayKey = dateUtils.getYYYYMMDD(new Date())
  const todayIndex = CONFERENCE_DAYS.findIndex(
    (day) => dateUtils.getYYYYMMDD(day.date) === todayKey,
  )
  return todayIndex >= 0 ? todayIndex : 0
}

export default function Schedule({
  sessionId,
  dayIndex,
  locationSlugs,
  editPermissions,
}: {
  sessionId?: string
  dayIndex?: number
  locationSlugs?: string[]
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
  const allScheduleLocations = useMemo(() => {
    return locations
      .filter((location) => location.display_in_schedule) // Only show locations that should be displayed in schedule
      .sort((a, b) => a.schedule_display_order - b.schedule_display_order) // Sort by display order
  }, [locations])

  // null = unfiltered (every location shown, no ?locations= in the URL)
  const [locationFilter, setLocationFilter] = useState<string[] | null>(
    locationSlugs ?? null,
  )

  const locationFilterOptions = useMemo(
    () =>
      allScheduleLocations.map((location) => ({
        value: locationSlug(location.name),
        label: location.name,
      })),
    [allScheduleLocations],
  )

  const selectedLocationSlugs =
    locationFilter ?? locationFilterOptions.map((option) => option.value)

  const scheduleLocations = useMemo(() => {
    if (!locationFilter) return allScheduleLocations
    return allScheduleLocations.filter((location) =>
      locationFilter.includes(locationSlug(location.name)),
    )
  }, [allScheduleLocations, locationFilter])

  const isLocationFiltered = locationFilter !== null

  // repeat(0, ...) is invalid CSS — the browser drops the whole declaration and
  // keeps the previous track list, leaving a full-width grid with no columns in it
  const gridTemplateColumns = scheduleLocations.length
    ? `60px repeat(${scheduleLocations.length}, minmax(180px, 360px))`
    : '60px'

  const handleLocationFilterChange = (slugs: string[]) => {
    // Selecting everything is the same as no filter; collapse so the URL stays clean
    setLocationFilter(
      slugs.length === locationFilterOptions.length ? null : slugs,
    )
  }

  const [filterForUserEvents, setFilterForUserEvents] = useState(false)

  // Group sessions by the 3 fixed conference days
  const days = useMemo(() => {
    // Compare full Pacific dates, not just day-of-month, so a stray
    // out-of-September session can't land on the wrong day
    const dayKeys = CONFERENCE_DAYS.map((day) => dateUtils.getYYYYMMDD(day.date))
    const schedulableLocationIds = new Set(
      allScheduleLocations.map((location) => location.id),
    )
    const dayEvents = CONFERENCE_DAYS.map(() => [] as DbFullSession[])

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
      if (!session.start_time || !session.end_time || !session.title) return

      const dayIndex = dayKeys.indexOf(
        dateUtils.getYYYYMMDD(new Date(session.start_time)),
      )
      if (dayIndex >= 0) {
        dayEvents[dayIndex].push(session)
      } else {
        console.warn(
          `Session "${session.title}" (${session.id}) starts at ${session.start_time}, outside the conference days — not displayed`,
        )
      }
    })

    // Create the final days array
    return CONFERENCE_DAYS.map((confDay, index) => {
      const events = dayEvents[index].sort((a, b) =>
        (a.start_time || '').localeCompare(b.start_time || ''),
      )

      // Derive the day's window from its sessions so nothing falls off the
      // grid, keeping the default window as a floor
      let startHour = DEFAULT_START_HOURS[index]
      let endHour = DEFAULT_END_HOURS[index]
      const placed: PlacedSession[] = []
      const unscheduled: DbFullSession[] = []

      events.forEach((session) => {
        if (
          !session.location_id ||
          !schedulableLocationIds.has(session.location_id)
        ) {
          unscheduled.push(session)
          return
        }
        const startMinutes = dateUtils.getPSTMinutes(session.start_time!)
        const trueDurationMinutes =
          (new Date(session.end_time!).getTime() -
            new Date(session.start_time!).getTime()) /
          60000
        // Clamp: at least 15 so the block stays clickable, and cut off at the
        // day's midnight since each grid only spans one day
        const durationMinutes = Math.max(
          15,
          Math.min(trueDurationMinutes, MINUTES_PER_DAY - startMinutes),
        )
        startHour = Math.min(startHour, Math.floor(startMinutes / 60))
        endHour = Math.max(
          endHour,
          Math.min(24, Math.ceil((startMinutes + durationMinutes) / 60)),
        )
        placed.push({ session, startMinutes, durationMinutes })
      })

      // Bucket once per day instead of filtering every slot x location on render
      const grid = new Map<string, Map<string, PlacedSession[]>>()
      placed.forEach((entry) => {
        const locationId = entry.session.location_id!
        const slot = slotForMinutes(entry.startMinutes)
        const locationSlots =
          grid.get(locationId) ?? new Map<string, PlacedSession[]>()
        locationSlots.set(slot, [...(locationSlots.get(slot) ?? []), entry])
        grid.set(locationId, locationSlots)
      })

      return {
        date: confDay.date,
        displayName: `${confDay.name} (${dateUtils.getYYYYMMDD(confDay.date)})`,
        shortDateDisplayName: `${confDay.name} (${dateUtils.getYYYYMMDD(confDay.date).slice(5)})`,
        shortName: confDay.name,
        events,
        startHour,
        endHour,
        slots: generateTimeSlots(startHour, endHour),
        grid,
        unscheduled,
      }
    })
  }, [sessions, filterForUserEvents, bookmarks, allScheduleLocations])
  const [currentDayIndex, setCurrentDayIndex] = useState(
    () => dayIndex ?? getDefaultDayIndex(),
  )
  const [openedSessionId, setOpenedSessionId] = useState<
    DbFullSession['id'] | null
  >(sessionId ?? null)
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)
  const [addEventPrefill, setAddEventPrefill] = useState<{
    startTime: string
    locationId: string
  } | null>(null)
  const [, setCurrentTimeForceUpdate] = useState(0)

  const openedSession = useMemo(() => {
    return sessions.find((s) => s.id === openedSessionId) ?? null
  }, [sessions, openedSessionId])

  // Sync URL parameters with state changes. Always write `day` — a guard like
  // "skip the default" makes links to the default day not survive a reload
  useEffect(() => {
    if (!pathname.startsWith('/schedule')) return
    const params = new URLSearchParams()
    params.set('day', currentDayIndex.toString())
    if (openedSessionId) params.set('session', openedSessionId)
    if (locationFilter?.length)
      params.set('locations', locationFilter.join(','))

    router.replace(`?${params.toString()}`, { scroll: false })
  }, [currentDayIndex, openedSessionId, locationFilter, router, pathname])

  const currentDay = days[currentDayIndex] || days[0]

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

  // Calculate current time position for the red line
  const getCurrentTimePosition = () => {
    const now = new Date()

    // Check if current day matches the selected day
    if (
      dateUtils.getYYYYMMDD(now) !== dateUtils.getYYYYMMDD(currentDay.date)
    ) {
      return null // Not today, don't show the line
    }

    const currentMinutes = dateUtils.getPSTMinutes(now.toISOString())
    const startMinutes = currentDay.startHour * 60
    const endMinutes = currentDay.endHour * 60

    // Only show if within schedule hours
    if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
      return null
    }

    // Calculate offset from start of schedule in pixels (2px per minute)
    const offsetFromStart = (currentMinutes - startMinutes) * 2
    return offsetFromStart
  }

  const currentTimePosition = getCurrentTimePosition()

  // Update current time position every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update current time position every minute
      setCurrentTimeForceUpdate((prev) => prev + 1)
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex w-fit max-w-full flex-col rounded-2xl bg-dark-500 font-serif">
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
      <div className="no-scrollbar max-w-full flex-1 overflow-x-auto overflow-y-hidden">
        <div className="h-fit min-w-fit">
          {/* Images Row - Scrollable on mobile, sticky on large */}
          <div
            className="grid w-fit bg-dark-400 lg:top-0 lg:z-30"
            style={{ gridTemplateColumns }}
          >
            <div
              className={`sticky left-0 z-30 border border-b-0 border-secondary-300 bg-dark-600 p-3 ${isLocationFiltered ? 'animate-filter-active' : ''}`}
            >
              {/* Merged with the filter cell below it — both rows are location headers */}
            </div>
            {scheduleLocations.map((location) => (
              <div
                key={location.id}
                className="border border-secondary-300 bg-dark-600 p-3"
              >
                {location.name === 'The Clocktower' ? (
                  <BloodDrippingFrame className="z-1 mx-auto h-24 w-fit">
                    {location.thumbnail_url ? (
                      <Image
                        src={location.thumbnail_url}
                        alt={location.name}
                        width={100}
                        height={100}
                        className="h-24 w-auto max-w-full object-cover"
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
                    className="mx-auto h-24 w-auto max-w-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-full bg-dark-500" />
                )}
              </div>
            ))}
          </div>

          {/* Names Row - Always sticky, with day nav on mobile */}
          <div
            className="sticky top-0 z-20 grid w-fit bg-dark-400"
            style={{ gridTemplateColumns }}
          >
            <div
              className={`sticky top-0 left-0 z-30 border border-t-0 border-b-2 border-secondary-300 bg-dark-600 p-3 ${isLocationFiltered ? 'animate-filter-active' : ''}`}
            >
              <div className="sticky flex size-full flex-col items-center justify-center gap-4 text-sm font-medium text-secondary-300">
                <LocationFilterMenu
                  options={locationFilterOptions}
                  selected={selectedLocationSlugs}
                  onChange={handleLocationFilterChange}
                />
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
            className={`relative grid w-fit bg-dark-400 ${scheduleLocations.length === 0 ? 'hidden' : ''}`}
            style={{ gridTemplateColumns }}
          >
            {currentDay.slots.map((time) => (
              <div key={time} className="contents">
                {/* Time Cell - Sticky Left */}
                <div className="sticky top-0 left-0 z-sticky flex w-full justify-center border border-dark-400 border-r-secondary-300 bg-dark-500">
                  <div className="text-sm font-medium text-secondary-300">
                    {time}
                  </div>
                </div>

                {/* Venue Cells */}
                {scheduleLocations.map((venue) => {
                  const eventsInSlot =
                    currentDay.grid.get(venue.id)?.get(time) ?? []
                  return (
                    <div
                      key={venue.id}
                      className="relative min-h-[60px] overflow-visible border border-dark-400 bg-dark-500"
                    >
                      {eventsInSlot.map(
                        ({ session, startMinutes, durationMinutes }, index) => (
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
                            className={`group absolute z-content m-0.5 cursor-pointer rounded-md border-2 p-1 ${getEventColor(session)} font-semibold text-black`}
                            style={{
                              top: `${(startMinutes % 30) * 2}px`, // 2px per minute
                              height: `${durationMinutes * 2}px`, // 2px per minute
                              // Double-booked slots share the cell side by side
                              // instead of stacking invisibly on top of each other
                              left: `${(index * 100) / eventsInSlot.length}%`,
                              width: `calc(${100 / eventsInSlot.length}% - 4px)`,
                              boxShadow: isUserRsvpd(session.id!)
                                ? '0 0 0 3px #ff33be'
                                : undefined,
                            }}
                          >
                            <div className="relative flex size-full flex-col">
                              <div className="text-sm leading-tight font-bold">
                                <SessionTitle title={session.title} />
                              </div>
                              <HostListLinks session={session} />
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

            {/* Current Time Indicator - Red horizontal line */}
            {currentTimePosition !== null && (
              <div
                className="pointer-events-none absolute right-0 left-0 z-[50] h-[2px] bg-red-600 shadow-lg"
                style={{
                  top: `${currentTimePosition}px`,
                }}
              >
                {/* Time label on the left */}
                <div className="absolute top-[-12px] left-2 rounded bg-red-600 px-1 py-0.5 text-xs font-medium text-white shadow-lg">
                  {dateUtils.getStringTime(new Date().toISOString())}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {scheduleLocations.length === 0 && (
        <div className="w-full p-8 text-center text-sm text-secondary-300">
          No locations selected — pick some from the filter menu.
        </div>
      )}

      {/* Sessions this day that have no schedulable location — surfaced here
          instead of silently dropped from the grid */}
      {currentDay.unscheduled.length > 0 && (
        <div className="w-full border-t border-secondary-300 p-4">
          <h3 className="mb-2 text-sm font-semibold text-secondary-300">
            Location TBD
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentDay.unscheduled.map((session) => (
              <button
                key={session.id}
                onClick={() => handleOpenSessionModal(session.id!)}
                className={`cursor-pointer rounded-md border-2 p-2 text-left text-sm font-semibold text-black ${getEventColor(session)}`}
              >
                <SessionTitle title={session.title} />
                <div className="font-sans text-xs font-normal">
                  {dateUtils.getStringTime(session.start_time!)}
                  {session.end_time &&
                    ` - ${dateUtils.getStringTime(session.end_time)}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

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
