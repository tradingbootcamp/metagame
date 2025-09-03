import { DbFullSession } from '@/types/database/dbTypeAliases'

export const gCalLinkFromSession = (session: DbFullSession) => {
  const addressString = '2740 Telegraph Ave, Berkeley, CA 94705'
  const locationString = session.location?.name
    ? `Location: ${session.location.name}`
    : ''
  const title = `Metagame: ${session.title || 'Untitled Session'}`
  const detailsString = `${locationString}\n=================\n${session.description || ''}`
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${session.start_time}/${session.end_time}&location=${encodeURIComponent(addressString)}&details=${encodeURIComponent(detailsString)}`
}
