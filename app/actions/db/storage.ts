'use server'

import { adminExportWrapper, currentUserWrapper } from './auth'

import { storageService } from '@/lib/db/storage'

/* Queries */
export const getCurrentUserProfilePictureUploadUrl = currentUserWrapper(
  storageService.getUserProfilePictureUploadUrl,
)

/* Admin versions */
export const adminGetUserProfilePictureUploadUrl = adminExportWrapper(
  storageService.getUserProfilePictureUploadUrl,
)
