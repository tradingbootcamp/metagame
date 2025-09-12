import { createClient } from './supabase/server'
import { createServiceClient } from './supabase/service'
import { redirect } from 'next/navigation'

export type AuthLevel = 'admin' | 'green' | 'volunteer'
export const redirectIfNotAuthed = async ({
  authLevel = 'admin',
  redirectTo = '/not-authorized',
}: { authLevel?: AuthLevel; redirectTo?: string } = {}) => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const serviceClient = createServiceClient()
  const { data, error } = await serviceClient
    .from('profiles')
    .select('is_admin, team, volunteer')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }
  if (!data) {
    redirect('/')
  }
  let authed = false
  switch (authLevel) {
    case 'admin':
      authed = data.is_admin
      break
    case 'green':
      authed = data.team === 'green' || data.is_admin
      break
    case 'volunteer':
      authed = data.volunteer || data.team === 'green' || data.is_admin
      break
  }

  if (!authed) {
    redirect(redirectTo)
  }
}
