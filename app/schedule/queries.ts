import { ApiAllLocationsResponse as ApiLocationsResponse } from '../api/queries/locations/route'
import { ApiUserFullProfileResponse } from '../api/queries/profiles/[userId]/route'
import { ApiCurrentUserFullProfileResponse } from '../api/queries/profiles/current/route'
import { ApiFullProfilesResponse } from '../api/queries/profiles/route'
import { ApiUserRsvpsResponse } from '../api/queries/rsvps/[userId]/route'
import { ApiCurrentUserRsvpsResponse } from '../api/queries/rsvps/current/route'
import { ApiRsvpsResponse } from '../api/queries/rsvps/route'
import { ApiUserSessionBookmarksResponse } from '../api/queries/session-bookmarks/[userId]/route'
import { ApiCurrentUserSessionBookmarksResponse } from '../api/queries/session-bookmarks/current/route'
import { ApiAllSessionBookmarksResponse } from '../api/queries/session-bookmarks/route'
import { ApiSessionResponse } from '../api/queries/sessions/[id]/route'
import { ApiAllSessionsResponse } from '../api/queries/sessions/route'

// Utility function to handle API errors with detailed information
const handleApiError = async (
  response: Response,
  defaultMessage: string,
): Promise<never> => {
  let errorDetails = defaultMessage
  try {
    const errorData = await response.json()
    errorDetails = errorData.message || errorData.error || errorDetails
    if (errorData.details) {
      console.error('API Error Details:', errorData.details)
    }
  } catch {
    // If we can't parse the error response, use the status text
    errorDetails = `${errorDetails}: ${response.status} ${response.statusText}`
  }
  throw new Error(errorDetails)
}

export const fetchSessions = async (): Promise<ApiAllSessionsResponse> => {
  const response = await fetch('/api/queries/sessions')
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch sessions')
  }

  return await response.json()
}

export const fetchLocations = async (): Promise<ApiLocationsResponse> => {
  const response = await fetch('/api/queries/locations')
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch locations')
  }

  return await response.json()
}

export const adminFetchFullProfiles =
  async (): Promise<ApiFullProfilesResponse> => {
    const response = await fetch('/api/queries/profiles')
    if (!response.ok) {
      await handleApiError(response, 'Failed to fetch profiles')
    }

    return await response.json()
  }

export const fetchSessionById = async (
  sessionId: string,
): Promise<ApiSessionResponse> => {
  const response = await fetch(`/api/queries/sessions/${sessionId}`)
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch session')
  }

  return await response.json()
}

export const fetchCurrentUserSessionBookmarks =
  async (): Promise<ApiCurrentUserSessionBookmarksResponse> => {
    const response = await fetch('/api/queries/session-bookmarks/current')
    if (!response.ok) {
      await handleApiError(response, 'Failed to fetch session bookmarks')
    }

    return await response.json()
  }

export const fetchUserSessionBookmarks = async (
  userId: string,
): Promise<ApiUserSessionBookmarksResponse> => {
  const response = await fetch(`/api/queries/session-bookmarks/${userId}`)
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch user session bookmarks')
  }

  return await response.json()
}

export const fetchAllSessionBookmarks =
  async (): Promise<ApiAllSessionBookmarksResponse> => {
    const response = await fetch('/api/queries/session-bookmarks')
    if (!response.ok) {
      await handleApiError(response, 'Failed to fetch all session bookmarks')
    }

    return await response.json()
  }

export const fetchCurrentUserProfile =
  async (): Promise<ApiCurrentUserFullProfileResponse> => {
    const response = await fetch('/api/queries/profiles/current')
    if (!response.ok) {
      await handleApiError(response, 'Failed to fetch current user profile')
    }

    return await response.json()
  }

export const fetchUserProfile = async (
  userId: string,
): Promise<ApiUserFullProfileResponse> => {
  const response = await fetch(`/api/queries/profiles/${userId}`)
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch user profile')
  }

  return await response.json()
}

export const fetchAllRsvps = async (): Promise<ApiRsvpsResponse> => {
  const response = await fetch('/api/queries/rsvps')
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch all RSVPs')
  }

  return await response.json()
}

export const fetchUserRsvps = async (
  userId: string,
): Promise<ApiUserRsvpsResponse> => {
  const response = await fetch(`/api/queries/rsvps/${userId}`)
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch user RSVPs')
  }

  return await response.json()
}

// Update existing fetchCurrentUserRsvps to use the new current endpoint
export const fetchCurrentUserRsvps =
  async (): Promise<ApiCurrentUserRsvpsResponse> => {
    const response = await fetch('/api/queries/rsvps/current')
    if (!response.ok) {
      await handleApiError(response, 'Failed to fetch current user RSVPs')
    }

    return await response.json()
  }
