'use client'

import { FaApple, FaGoogle } from 'react-icons/fa'
import { IoCalendarNumberSharp } from 'react-icons/io5'

import { buttonVariants } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { gCalLinkFromSession } from '@/app/schedule/scheduleUtils'

import { DbCalendarSession } from '@/types/database/dbTypeAliases'

export function AddToCalendar({ session }: { session: DbCalendarSession }) {
  return (
    <Popover>
      <PopoverTrigger
        className={buttonVariants({ variant: 'ghost', size: 'icon' })}
        aria-label="Add to calendar"
        title="Add to calendar"
      >
        <IoCalendarNumberSharp className="size-4 text-white" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-1">
        <div className="flex items-center gap-2">
          <a
            title="Add to Google Calendar"
            rel="noreferrer"
            target="_blank"
            href={gCalLinkFromSession(session)}
            className="rounded p-1 text-secondary-300 hover:bg-accent hover:text-accent-foreground"
          >
            <FaGoogle className="size-5" />
          </a>
          <a
            title="Download iCal/ICS"
            rel="noreferrer"
            target="_blank"
            href={`/api/queries/sessions/${session.id}/ics`}
            className="rounded p-1 text-secondary-300 hover:bg-accent hover:text-accent-foreground"
          >
            <FaApple className="size-5" />
          </a>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default AddToCalendar
