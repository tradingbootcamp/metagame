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
  const hosts = [session.host_1, session.host_2, session.host_3].filter(
    Boolean,
  ) as NonNullable<DbFullSession['host_1']>[]
  return (
    <div className="leading-none">
      {hosts.map(({ first_name, last_name, id }, idx) => {
        const hostName = `${first_name} ${last_name || ''}`.trim()
        return (
          <span key={id} className="font-sans text-xs">
            <Link
              href={`/profile/${id}`}
              className={cn('hover:underline', className)}
              onClick={(e) => e.stopPropagation()}
            >
              {hostName}
            </Link>
            {idx < hosts.length - 1 && ', '}
          </span>
        )
      })}
    </div>
  )
}
