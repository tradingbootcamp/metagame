import { dbGetHostsFromSession } from '@/utils/dbUtils'

import { DbFullSession } from '@/types/database/dbTypeAliases'

export const gCalLinkFromSession = (session: DbFullSession) => {
  const addressString = '2740 Telegraph Ave, Berkeley, CA 94705'
  const locationString = session.location?.name
    ? `Location: ${session.location.name}`
    : ''
  const title = `Metagame: ${session.title || 'Untitled Session'}`
  const hostsString = dbGetHostsFromSession(session).join(', ')
  const detailsString = `${locationString}\nHosts: ${hostsString}\n\n=================\n\n${session.description + '\n\n=================\n\n' || ''}${sessionLink(session.id)}`
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${session.start_time}/${session.end_time}&location=${encodeURIComponent(addressString)}&details=${encodeURIComponent(detailsString)}`
}

export const sessionLink = (sessionId: string) => {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/schedule?session=${sessionId}`
}
