'use server'

import { adminExportWrapper, currentUserWrapper } from './auth'

import { sessionBookmarkService } from '@/lib/db/sessionBookmarks'

export const currentUserBookmarkSession = currentUserWrapper(
  sessionBookmarkService.bookmarkSessionForUser,
)
export const currentUserUnbookmarkSession = currentUserWrapper(
  sessionBookmarkService.unbookmarkSessionForUser,
)
export const currentUserToggleSessionBookmark = currentUserWrapper(
  sessionBookmarkService.toggleBookmarkSessionForUser,
)

export const currentUserGetSessionBookmarks = async () =>
  currentUserWrapper(sessionBookmarkService.getUserSessionBookmarks)({})

export const adminGetUserSessionBookmarks = adminExportWrapper(
  sessionBookmarkService.getUserSessionBookmarks,
)

export const adminGetAllSessionBookmarks = adminExportWrapper(
  sessionBookmarkService.getAllSessionBookmarks,
)
