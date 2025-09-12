import CheckinTable from './CheckinTable'

import { createServiceClient } from '@/utils/supabase/service'

import { DbFullTicket } from '@/types/database/dbTypeAliases'

export default async function CheckinPage() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('tickets')
    .select(
      '*, owner:profiles!tickets_owner_id_fkey(id, first_name, last_name, email, team)',
    )
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold">Check-in Management</h1>
        <div className="text-red-600">Error: {error.message}</div>
      </div>
    )
  }

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
      <CheckinTable tickets={data as DbFullTicket[]} />
    </div>
  )
}
