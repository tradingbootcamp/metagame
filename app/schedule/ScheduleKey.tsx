import { cn } from '@/lib/utils'

import { DbSessionCategory } from '@/types/database/dbTypeAliases'

export default function ScheduleKey({
  categoryColorMapping,
  className,
}: {
  categoryColorMapping: Record<DbSessionCategory, string>
  className?: string
}) {
  return (
    <div className={cn('flex gap-2', className)}>
      {Object.entries(categoryColorMapping).map(([category, colorClass]) => (
        <div key={category} className={`flex items-center gap-2`}>
          <div className={`h-4 w-4 rounded-full border-2 ${colorClass}`} />
          <span className="text-sm capitalize">{category}</span>
        </div>
      ))}
    </div>
  )
}
