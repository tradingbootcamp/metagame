'use server'

import { createServiceClient } from '@/utils/supabase/service'

export default async function CheckinPage() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('tickets')
    .select(
      '*, owner:profiles!tickets_owner_id_fkey(id, first_name, last_name)',
    )
  if (error) {
    return <div>Error: {error.message}</div>
  }
  if (!data) {
    return <div>No tickets found</div>
  }

  return <div>Checkin</div>
}
