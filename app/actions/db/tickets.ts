'use server'

import { adminExportWrapper } from './auth'

import { ticketsService } from '@/lib/db/tickets'
import { usersService } from '@/lib/db/users'

import { TEAM_COLORS } from '@/utils/dbUtils'
import { authLevelsToRanks, getCurrentUserAuthRank } from '@/utils/security'
import { createServiceClient } from '@/utils/supabase/service'

import { DbTicket } from '@/types/database/dbTypeAliases'

export const adminGetAllTickets = adminExportWrapper(
  ticketsService.getAllTickets,
)
export const signupByTicketCode = async ({
  email,
  password,
  ticketCode,
}: {
  email: string
  password: string
  ticketCode: string
}): Promise<{
  success: boolean
  error: string | null
  ticket: DbTicket | null
}> => {
  const ticket = await ticketsService.getTicketByCode({ code: ticketCode })
  if (!ticket) {
    throw new Error('Ticket not found')
  }
  if (ticket.owner_id) {
    return { success: false, error: 'claimed', ticket: null }
  }
  let userId: string
  const supabase = createServiceClient()
  const existingUser = await usersService.getUserFullProfileByEmail({ email })
  if (existingUser) {
    userId = existingUser.id
    const userHasTicket = await ticketsService.getTicketsByOwnerId({
      ownerId: userId,
    })
    if (userHasTicket.length > 0) {
      return {
        success: false,
        error: 'This email already has an account with a ticket!',
        ticket: null,
      }
    }
  } else {
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      if (error.code?.includes('rate_limit')) {
        return { success: false, error: 'rate_limit', ticket: null }
      }
    }
    if (!user || error) {
      throw new Error('Error signing up new user: ' + error?.message)
    }
    userId = user.id
  }
  await ticketsService.updateTicketOwner({ ticketCode, ownerId: userId })
  await usersService.updateUserProfile({
    userId,
    data: {
      team: [TEAM_COLORS.ORANGE, TEAM_COLORS.PURPLE][
        Math.floor(Math.random() * 2)
      ],
    },
  })
  return { success: true, error: null, ticket: ticket }
}
export const volunteerGetAllFullTickets = async () => {
  if ((await getCurrentUserAuthRank()) < authLevelsToRanks.VOLUNTEER)
    throw new Error('Unauthorized')
  return await ticketsService.getAllFullTickets()
}
