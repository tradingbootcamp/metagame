'use server'

import {
  adminExportWrapper,
  authedExportWrapper,
  currentUserWrapper,
} from './auth'

import { playerCardClaimsService } from '@/lib/db/playerCardClaims'
import { sessionsService } from '@/lib/db/sessions'
import { usersService } from '@/lib/db/users'
import {
  SelfEditableProfileData,
  selfEditableProfileSchema,
} from '@/lib/schemas/profile'

import { assertAuthLevel } from '@/utils/security'

/* Queries */
// Deliberately public: reads the caller's own session cookie, so it can only
// ever return the caller's own user (or null)
export const getCurrentUser = async () => usersService.getCurrentUser()
export const getCurrentUserFullProfile = async () =>
  currentUserWrapper(usersService.getUserFullProfile)({})
export const getCurrentUserAdminStatus = async () =>
  currentUserWrapper(usersService.getUserAdminStatus)({})
export const adminGetAllFullProfiles = adminExportWrapper(
  usersService.getAllFullProfiles,
)
export const adminGetUserFullProfileByEmail = adminExportWrapper(
  usersService.getUserFullProfileByEmail,
)
export const adminGetUserFullProfileById = adminExportWrapper(
  usersService.getUserFullProfile,
)

export const adminGetUser = adminExportWrapper(usersService.getUser)
/** Signed-in only: the unstripped public projection carries fields anonymous
 * callers must not see (the anonymous path is the API route, which redacts) */
export const getUserPublicProfileById = authedExportWrapper(
  usersService.getUserPublicProfileById,
)
/* Mutations */
/** Self-service profile update. The payload is parsed against an allowlist before it
 * reaches the DB: forwarding a raw `TablesUpdate<'profiles'>` here would let any
 * logged-in user set their own `is_admin`, `team`, `checked_in` or `player_id`. */
export const updateCurrentUserProfile = currentUserWrapper(
  async ({
    userId,
    data,
  }: {
    userId: string
    data: SelfEditableProfileData
  }) => {
    const allowedData = selfEditableProfileSchema.parse(data)
    if (Object.keys(allowedData).length === 0) {
      throw new Error('No self-editable profile fields supplied')
    }
    return usersService.updateUserProfile({ userId, data: allowedData })
  },
)
/** Updates a user's checked in status if the current user has any admin privileges */
export const volunteerUpdateUserCheckin = async ({
  userId,
  checked_in,
}: {
  userId: string
  checked_in: boolean
}) => {
  await assertAuthLevel({ authLevel: 'VOLUNTEER' })
  await usersService.updateUserProfile({ userId, data: { checked_in } })
}
export const deleteCurrentUserProfilePicture = async () =>
  currentUserWrapper(usersService.deleteProfilePicture)({})
export const adminDeleteUserProfilePicture = adminExportWrapper(
  usersService.deleteProfilePicture,
)
export const fullDeleteCurrentUser = async () =>
  currentUserWrapper(usersService.fullDeleteUser)({})
export const adminFullDeleteUser = adminExportWrapper(
  usersService.fullDeleteUser,
)
// Admin mutation for updating any user's profile
export const adminUpdateUserProfile = adminExportWrapper(
  usersService.updateUserProfile,
)

export const adminGetUsersFullProfiles = adminExportWrapper(
  usersService.getUsersFullProfiles,
)

// Admin mutation for updating any user's password
export const adminUpdateUserPassword = adminExportWrapper(
  usersService.updateUserPassword,
)

export const currentUserSelectCardReward = currentUserWrapper(
  async ({
    userId,
    celestialCardId,
    sessionId,
  }: {
    userId: string
    celestialCardId: number
    sessionId: string
  }) => {
    // look up which team won session and check that user is on that team and rsvpd to that session
    const session = await sessionsService.getSessionById({ sessionId })
    if (!session) {
      throw new Error('Session not found. Please refresh and try again.')
    }
    const winningTeam = session.winning_team
    if (!winningTeam) {
      throw new Error(
        'This session has no winning team yet. Card rewards are not available.',
      )
    }
    const userProfile = await usersService.getUserPublicProfileById({ userId })
    if (!userProfile) {
      throw new Error('User profile not found. Please refresh and try again.')
    }
    const userCardClaim =
      await playerCardClaimsService.getPlayerCardClaimsByUserIdAndSessionId({
        userId,
        sessionId,
      })
    if (!userCardClaim) {
      throw new Error('No valid card claim found for this user and session')
    }
    if (userCardClaim.new_card_id) {
      throw new Error(
        'You have already claimed a card reward for this session.',
      )
    }
    const cardRewards = session.card_rewards
    // verify that the card is in the list of allowed card rewards or the user is keeping their current celestial card
    if (
      !cardRewards.map((card) => card.id).includes(celestialCardId) &&
      !(celestialCardId == userProfile.celestial_card_id)
    ) {
      throw new Error(
        'The selected card is not available as a reward for this session.',
      )
    }
    return playerCardClaimsService.makePlayerCardClaim({
      userId,
      sessionId,
      newCardId: celestialCardId,
    })
  },
)

export const currentUserLatestUnclaimedVictory = async ({
  timeWindow,
}: {
  timeWindow: number
}) => {
  const user = await usersService.getCurrentUser()
  if (!user) {
    return null
  }
  const playerCardClaims =
    await playerCardClaimsService.getOpenPlayerCardClaimsByPlayerId({
      userId: user.id,
      timeWindow,
    })
  if (playerCardClaims.length === 0) {
    return null
  }
  return playerCardClaims[0] // throw away all but most recent
}
