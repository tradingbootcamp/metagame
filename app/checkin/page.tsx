import { volunteerGetAllFullTickets } from '../actions/db/tickets'
import CheckinTable from './CheckinTable'

export default async function CheckinPage() {
  const data = await volunteerGetAllFullTickets()

  if (!data) {
    return (
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold">Check-in Management</h1>
        <div>No tickets found</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Check-in Management</h1>
      <CheckinTable tickets={data} />
    </div>
  )
}
