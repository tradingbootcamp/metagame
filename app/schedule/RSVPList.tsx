import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

import { countRsvpsByTeamColor } from '@/utils/dbUtils'

import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { adminUnRsvpUserFromSession } from '@/app/actions/db/sessionRsvps'

import { useUser } from '@/hooks/useUser'
import { DbFullSession, DbTeamColor } from '@/types/database/dbTypeAliases'

export const AttendanceDisplay = ({
  session,
  userLoggedIn,
}: {
  session: DbFullSession
  userLoggedIn: boolean
}) => {
  const teamCap = session.max_capacity
    ? Math.floor(session.max_capacity / 2)
    : undefined
  const standardRsvpDisplay = () => {
    if (!userLoggedIn) {
      return (
        <div>
          {session.min_capacity && session.max_capacity
            ? session.min_capacity === session.max_capacity
              ? `${session.min_capacity}`
              : `${session.min_capacity} - ${session.max_capacity}`
            : null}
        </div>
      )
    }

    return (
      <span>
        {session.max_capacity
          ? `${session.rsvps.length} / ${session.max_capacity}`
          : `${session.rsvps.length}`}
      </span>
    )
  }
  const megagameRsvpDisplay = () => {
    // For megagames, we need the team breakdown from client-side RSVP data (once we implement teams)
    const teamCounts = countRsvpsByTeamColor(session.rsvps)
    return (
      <div className="flex items-center gap-1 font-sans text-xs">
        <div className="rounded-md bg-gray-200 px-1 py-0.5">
          <span className="font-bold text-purple-500">
            {teamCap ? `${teamCounts.purple}/${teamCap}` : teamCounts.purple}
          </span>
        </div>
        {/* <span className="font-bold text-black">||</span> */}
        <div className="rounded-md bg-gray-200 px-1 py-0.5">
          <span className="font-bold text-red-500">
            {teamCap ? `${teamCounts.orange}/${teamCap}` : teamCounts.orange}
          </span>
        </div>
      </div>
    )
  }
  return (
    <Tooltip clickable>
      <TooltipTrigger className="flex items-center gap-1">
        <UserIcon className="size-3" />
        {session.megagame ? megagameRsvpDisplay() : standardRsvpDisplay()}
      </TooltipTrigger>
      <TooltipContent className="">
        <RSVPListModal session={session} />
      </TooltipContent>
    </Tooltip>
  )
}
const RSVPListModal = ({ session }: { session: DbFullSession }) => {
  const { currentUserProfile } = useUser()
  const queryClient = useQueryClient()
  const unrsvpUserMutation = useMutation({
    mutationFn: adminUnRsvpUserFromSession,
    onMutate: async ({ sessionId, userId }) => {
      await queryClient.cancelQueries({ queryKey: ['sessions'] })
      const previousSessions = queryClient.getQueryData<DbFullSession[]>([
        'sessions',
      ])
      queryClient.setQueryData<DbFullSession[]>(
        ['sessions'],
        (old) =>
          old?.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  rsvps: session.rsvps.filter(
                    (rsvp) => rsvp.user_id !== userId,
                  ),
                }
              : session,
          ) || [],
      )
      return { previousSessions }
    },
    onError: (err, variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(['sessions'], context.previousSessions)
      }
      toast.error(`Failed to un-RSVP user from session: ${err.message}`)
    },
    onSuccess: () => {
      toast.success('User un-RSVPed from session')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
  const rsvps = session.rsvps
  const teamsToBgColors: Record<DbTeamColor, string> = {
    orange: 'text-orange-600',
    purple: 'text-fuchsia-700',
    green: 'text-green-500',
    unassigned: 'text-gray-600',
  }

  function nameDisplay(user: DbFullSession['rsvps'][number]['user']) {
    if (user.first_name) {
      return user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.first_name
    }
    return 'Anonymous'
  }
  const waitlist = rsvps
    .filter((rsvp) => rsvp.on_waitlist)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
  const going = rsvps
    .filter((rsvp) => !rsvp.on_waitlist)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
  const rsvpListUl = (rsvpArray: DbFullSession['rsvps']) => {
    return (
      <ul className="flex w-full flex-col items-start">
        {rsvpArray.map((rsvp) => (
          <li
            key={rsvp.session_id + rsvp.user_id}
            className={`${teamsToBgColors[rsvp.user.team]} flex w-full items-center gap-2 py-1`}
          >
            {currentUserProfile?.is_admin && (
              <button
                title="Un-RSVP user"
                className="cursor-pointer rounded-xs p-0.5 text-red-400 hover:bg-bg-primary disabled:cursor-not-allowed disabled:opacity-50"
                onClick={(e) => {
                  e.stopPropagation()
                  unrsvpUserMutation.mutate({
                    sessionId: session.id,
                    userId: rsvp.user_id,
                  })
                }}
              >
                <XIcon className="size-3" />
              </button>
            )}
            <span className="min-w-0 flex-1 truncate font-medium">
              {nameDisplay(rsvp.user)}
            </span>
          </li>
        ))}
      </ul>
    )
  }
  // Megagame: two side-by-side lists filtered by team
  if (session.megagame) {
    const teamCap = session.max_capacity
      ? Math.floor(session.max_capacity / 2)
      : undefined
    const goingOrange = going.filter((r) => r.user.team === 'orange')
    const goingPurple = going.filter((r) => r.user.team === 'purple')
    const waitOrange = waitlist.filter((r) => r.user.team === 'orange')
    const waitPurple = waitlist.filter((r) => r.user.team === 'purple')

    const TeamColumn = ({
      goingList,
      waitList,
      accentBgClass,
      className = '',
    }: {
      goingList: typeof going
      waitList: typeof waitlist
      accentBgClass: string
      className?: string
    }) => (
      <div className={`flex min-w-0 flex-col justify-start ${className}`}>
        <div className="mt-1 flex flex-col">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`w-fit rounded-sm px-2 py-0.5 text-xs font-bold text-white ${accentBgClass}`}
            >
              Going
            </span>
            <span className="text-xs font-bold">
              ({goingList.length}
              {teamCap ? `/${teamCap}` : ''})
            </span>
          </div>
          <Separator className="my-1" />
          {rsvpListUl(goingList)}
        </div>
        {waitList.length > 0 && (
          <div className="mt-2">
            <span className="text-left font-bold">
              Waitlist ({waitList.length})
            </span>
            <Separator className="my-1" />
            {rsvpListUl(waitList)}
          </div>
        )}
      </div>
    )

    return (
      <div className="relative box-border w-full max-w-[90vw] overflow-x-hidden sm:max-w-[560px]">
        {/* Center divider line on larger screens */}
        <div className="absolute inset-y-1 left-1/2 hidden w-px -translate-x-1/2 bg-gray-600 sm:block" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <TeamColumn
            goingList={goingOrange}
            waitList={waitOrange}
            accentBgClass="bg-orange-500"
            className="sm:pr-4"
          />
          <TeamColumn
            goingList={goingPurple}
            waitList={waitPurple}
            accentBgClass="bg-fuchsia-700"
            className="sm:pl-4"
          />
        </div>
      </div>
    )
  }

  // Standard (non-megagame) list
  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-start">
        <div className="flex flex-col justify-start">
          <span className="w-fit text-left font-bold">
            Going ({going.length}
            {session.max_capacity ? `/${session.max_capacity}` : ''})
          </span>
          <Separator />
        </div>
        {rsvpListUl(going)}
      </div>
      {waitlist.length > 0 && (
        <>
          <Separator />
          <div>
            <span className="text-left font-bold">
              Waitlist ({waitlist.length})
            </span>
            <Separator />
            {rsvpListUl(waitlist)}
          </div>
        </>
      )}
    </div>
  )
}
