'use server'

import { adminExportWrapper, currentUserWrapper } from './auth'

import { usersService } from '@/lib/db/users'

/* Queries */
export const getCurrentUser = usersService.getCurrentUser
export const getCurrentUserProfile = async () =>
  currentUserWrapper(usersService.getUserProfile)({})
export const getCurrentUserAdminStatus = async () =>
  currentUserWrapper(usersService.getUserAdminStatus)({})
export const adminGetAllProfiles = adminExportWrapper(
  usersService.getAllProfiles,
)
export const adminGetUserProfileByEmail = adminExportWrapper(
  usersService.getUserProfileByEmail,
)
export const adminGetUserProfileById = adminExportWrapper(
  usersService.getUserProfile,
)

export const adminGetUser = adminExportWrapper(usersService.getUser)

/* Mutations */
export const updateCurrentUserProfile = currentUserWrapper(
  usersService.updateUserProfile,
)
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
