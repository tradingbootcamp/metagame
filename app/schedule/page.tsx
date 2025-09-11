import ScheduleKey from './ScheduleKey'
import ScheduleProvider from './ScheduleProvider'
import { z } from 'zod'

import { LocationsProvider } from '@/hooks/useLocations'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
const sessionIdSchema = z.uuid()
const dayIndexSchema = z.coerce.number()

export default async function ScheduleDemo({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { session: sessionIdParam, day: dayIndexParam } = await searchParams

  const parsedSessionId = sessionIdSchema.safeParse(sessionIdParam)
  const parsedDayIndex = dayIndexSchema.safeParse(dayIndexParam)
  const dayIndex =
    parsedDayIndex.success && [0, 1, 2].includes(parsedDayIndex.data)
      ? parsedDayIndex.data
      : undefined
  return (
    <div className="h-fit w-full bg-dark-500 p-4">
      <div className="flex w-full flex-col gap-2 overflow-hidden rounded-2xl border border-secondary-300">
        <LocationsProvider>
          <ScheduleProvider
            dayIndex={dayIndex}
            sessionId={
              parsedSessionId.success ? parsedSessionId.data : undefined
            }
          />
        </LocationsProvider>
        <ScheduleKey />
      </div>
    </div>
  )
}
