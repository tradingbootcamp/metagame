import Link from 'next/link'

import { cn } from '@/lib/utils'

import { DbFullSession } from '@/types/database/dbTypeAliases'

export const HostListLinks = ({
  session,
  className,
}: {
  session: DbFullSession
  className?: string
}) => {
  return (
    <div>
      {[
        { host: session.host_1, id: session.host_1_id },
        { host: session.host_2, id: session.host_2_id },
        { host: session.host_3, id: session.host_3_id },
      ]
        .filter(({ host }) => host?.first_name) // Only include hosts with names
        .map(({ host, id }) => {
          const hostName = `${host?.first_name} ${host?.last_name || ''}`.trim()
          return (
            <Link
              href={`/profile/${id}`}
              key={id}
              className={cn('font-sans text-xs hover:underline', className)}
              onClick={(e) => e.stopPropagation()}
            >
              {hostName}
            </Link>
          )
        })}
    </div>
  )
}
