import { DbFullTicket } from '@/types/database/dbTypeAliases'

export default function CheckinTable({ tickets }: { tickets: DbFullTicket[] }) {
  return <div>Checkin data for {tickets.length} tickets</div>
}
