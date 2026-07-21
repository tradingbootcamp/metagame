import ScheduleKey from './ScheduleKey'
import ScheduleProvider from './ScheduleProvider'
import { locationSlug } from './scheduleUtils'
import { z } from 'zod'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
const sessionIdSchema = z.uuid()
const dayIndexSchema = z.coerce.number()

export default async function ScheduleDemo({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const {
    session: sessionIdParam,
    day: dayIndexParam,
    locations: locationsParam,
  } = await searchParams

  const parsedSessionId = sessionIdSchema.safeParse(sessionIdParam)
  const parsedDayIndex = dayIndexSchema.safeParse(dayIndexParam)
  const dayIndex =
    parsedDayIndex.success && [0, 1, 2].includes(parsedDayIndex.data)
      ? parsedDayIndex.data
      : undefined
  // ?locations=the-clocktower,bayes-hall — slugified so hand-written links are forgiving
  const locationSlugs = [locationsParam ?? []]
    .flat()
    .flatMap((value) => value.split(','))
    .map(locationSlug)
    .filter(Boolean)
  return (
    <div className="h-fit w-full bg-dark-500 p-4">
      <div className="mx-auto flex w-fit max-w-full flex-col gap-2 overflow-hidden rounded-2xl border border-secondary-300">
        <ScheduleProvider
          dayIndex={dayIndex}
          sessionId={parsedSessionId.success ? parsedSessionId.data : undefined}
          locationSlugs={locationSlugs.length > 0 ? locationSlugs : undefined}
        />
        <ScheduleKey />
      </div>
    </div>
  )
}
