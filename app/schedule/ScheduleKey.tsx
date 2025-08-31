import { scheduleColors } from './scheduleColors'

import { cn } from '@/lib/utils'

export default function ScheduleKey({ className }: { className?: string }) {
  const continuousAttendanceKeys = ['game', 'megagame']
  const colorMapping = {
    ...scheduleColors.rsvpd.category,
    'kid friendly': scheduleColors.rsvpd.kids,
    megagame: scheduleColors.rsvpd.megagame,
  }
  return (
    <div className="flex flex-col items-center gap-2 p-1">
      <div
        className={cn(
          'flex flex-wrap items-center justify-center gap-2',
          className,
        )}
      >
        {Object.entries(colorMapping).map(([category, colorClass]) => (
          <div key={category} className={`flex items-center gap-2`}>
            <div className={`h-4 w-4 rounded-full border-2 ${colorClass}`} />
            <span className="text-sm capitalize">
              {category +
                (continuousAttendanceKeys.includes(category) ? '*' : '')}
            </span>
          </div>
        ))}
      </div>
      <span className="text-xs">
        * attending the full session strongly preferred
      </span>
    </div>
  )
}
