import { dbGetHostsFromSession } from '@/utils/dbUtils'

import { DbFullSession } from '@/types/database/dbTypeAliases'

export const sessionCalendarDateString = (date: Date) => {
  const year = date.getUTCFullYear().toString().padStart(4, '0')
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const day = date.getUTCDate().toString().padStart(2, '0')
  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  const seconds = date.getUTCSeconds().toString().padStart(2, '0')
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}
export const sessionCalendarDescription = (session: DbFullSession) => {
  const locationString = session.location?.name
    ? `Location: ${session.location.name}`
    : ''
  const hostsString = dbGetHostsFromSession(session).join(', ')
  const detailsString = `${locationString}\nHosts: ${hostsString}\n\n=================\n\n${session.description + '\n\n=================\n\n' || ''}${sessionLink(session.id)}`
  return detailsString
}
export const gCalLinkFromSession = (session: DbFullSession) => {
  const addressString = '2740 Telegraph Ave, Berkeley, CA 94705'
  const title = `Metagame: ${session.title || 'Untitled Session'}`
  const detailsString = sessionCalendarDescription(session)
  if (session.start_time && session.end_time) {
    const startTimeString = sessionCalendarDateString(
      new Date(session.start_time),
    )
    const endTimeString = sessionCalendarDateString(new Date(session.end_time))
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTimeString}/${endTimeString}&location=${encodeURIComponent(addressString)}&details=${encodeURIComponent(detailsString)}`
  }
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&location=${encodeURIComponent(addressString)}&details=${encodeURIComponent(detailsString)}`
}

export const sessionLink = (sessionId: string) => {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/schedule?session=${sessionId}`
}
