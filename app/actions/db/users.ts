'use server'

import { adminExportWrapper, currentUserWrapper } from './auth'

import { usersService } from '@/lib/db/users'

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

export const getAllUserPublicProfiles = usersService.getAllUserPublicProfiles
export const getUserPublicProfileById = usersService.getUserPublicProfileById
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
