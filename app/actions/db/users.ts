'use server'

import { adminExportWrapper, currentUserWrapper } from './auth'

import { playerCardClaimsService } from '@/lib/db/playerCardClaims'
import { sessionsService } from '@/lib/db/sessions'
import { usersService } from '@/lib/db/users'

import { authLevelsToRanks, getCurrentUserAuthRank } from '@/utils/security'

/* Queries */
export const getCurrentUser = usersService.getCurrentUser
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
export const getSpeakerIds = usersService.getSpeakerIds
export const getAllUserPublicProfiles = usersService.getAllUserPublicProfiles
export const getUserPublicProfileById = usersService.getUserPublicProfileById
export const getUserPublicProfileByPlayerId =
  usersService.getPublicProfileByPlayerId
export const getUsersIdsByTeam = usersService.getUsersIdsByTeam
export const getPublicProfilesByTeam = usersService.getPublicProfilesByTeam
/* Mutations */
export const updateCurrentUserProfile = currentUserWrapper(
  usersService.updateUserProfile,
)
/** Updates a user's checked in status if the current user has any admin privileges */
export const volunteerUpdateUserCheckin = async ({
  userId,
  checked_in,
}: {
  userId: string
  checked_in: boolean
}) => {
  if ((await getCurrentUserAuthRank()) < authLevelsToRanks.VOLUNTEER)
    throw new Error('Unauthorized')
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

export const getUsersPublicProfiles = usersService.getUsersPublicProfiles
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
