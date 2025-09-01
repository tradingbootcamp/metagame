import { UserIcon } from 'lucide-react'

import { countRsvpsByTeamColor } from '@/utils/dbUtils'

import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { DbFullSession, DbTeamColor } from '@/types/database/dbTypeAliases'

export const AttendanceDisplay = ({
  session,
  userLoggedIn,
}: {
  session: DbFullSession
  userLoggedIn: boolean
}) => {
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
      <div className="flex items-center gap-1 rounded-md bg-gray-200 px-1 py-0.5 font-sans text-xs">
        <span className="font-bold text-purple-500">{teamCounts.purple}</span>
        <span className="font-bold text-black">|</span>
        <span className="font-bold text-orange-400">{teamCounts.orange}</span>
      </div>
    )
  }
  return (
    <Tooltip clickable>
      <TooltipTrigger className="flex items-center gap-1">
        <UserIcon className="size-3" />
        {false ? megagameRsvpDisplay() : standardRsvpDisplay()}
      </TooltipTrigger>
      <TooltipContent className="">
        <RSVPListModal session={session} />
      </TooltipContent>
    </Tooltip>
  )
}

const RSVPListModal = ({ session }: { session: DbFullSession }) => {
  const rsvps = session.rsvps
  const teamsToBgColors: Record<DbTeamColor, string> = {
    orange: 'text-orange-500',
    purple: 'text-fuchsia-800',
    green: 'text-green-500',
    unassigned: 'text-white',
  }

  function nameDisplay(user: DbFullSession['rsvps'][number]['user']) {
    if (user.first_name) {
      return user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.first_name
    }
    if (user.email) {
      return user.email
    }
    return user.id
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
        <ul className="flex flex-col items-start">
          {going.map((rsvp) => (
            <li
              key={rsvp.session_id + rsvp.user_id}
              className={`${teamsToBgColors[rsvp.user.team]} p-1`}
            >
              {nameDisplay(rsvp.user)}
            </li>
          ))}
        </ul>
      </div>
      {waitlist.length > 0 && (
        <>
          <Separator />
          <div>
            <span className="text-left font-bold">
              Waitlist ({waitlist.length})
            </span>
            <Separator />
            <ul className="flex flex-col items-start">
              {waitlist.map((rsvp) => (
                <li
                  key={rsvp.session_id + rsvp.user_id}
                  className={`${teamsToBgColors[rsvp.user.team]} p-1`}
                >
                  {nameDisplay(rsvp.user)}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
