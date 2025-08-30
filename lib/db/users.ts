import { IdXorEmail } from '../types'
import { AuthError, UserResponse } from '@supabase/supabase-js'

import { storageService } from '@/lib/db/storage'

import { createClient } from '@/utils/supabase/server'
import { createServiceClient } from '@/utils/supabase/service'

import { DbProfileUpdate } from '@/types/database/dbTypeAliases'

export const usersService = {
  /** Get the current authenticated user */
  getCurrentUser: async () => {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  },
  /** Look up a user in auth table using id */
  getUserById: async ({ userId }: { userId: string }) => {
    const supabase = createServiceClient()
    return await supabase.auth.admin.getUserById(userId)
  },
  getUser: async (idOrEmail: IdXorEmail): Promise<UserResponse> => {
    const { id, email } = idOrEmail
    if (id) {
      return await usersService.getUserById({ userId: id })
    } else if (email) {
      const userProfile = await usersService.getUserProfileByEmail({ email })
      //TODO: handle multiple matching profiles; or enforce that we never will
      if (!userProfile) {
        return {
          data: { user: null },
          error: new AuthError(
            'No user found for email',
            404,
            'user_n0t_found',
          ),
        }
      }
      const { id } = userProfile
      const user = await usersService.getUserById({ userId: id })
      return user
    } else {
      throw new Error('Either id or email must be provided')
    }
  },
  /** Check if a user has admin status */
  getUserAdminStatus: async ({ userId }: { userId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single() // Error if we dont find the user because why not
    if (error) {
      throw new Error(error.message)
    }
    return data?.is_admin ?? false
  },

  /** Get a user's profile */
  getUserProfile: async ({ userId }: { userId: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  /** Update a user's profile */
  updateUserProfile: async ({
    userId,
    data,
  }: {
    userId: string
    data: DbProfileUpdate
  }) => {
    const supabase = createServiceClient()
    const { data: updatedData, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select()
    if (error) {
      throw new Error(error.message)
    }
    return updatedData
  },
  getUserProfileByEmail: async ({ email }: { email: string }) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle()
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  /** Get a signed URL for uploading a user's profile picture */
  getProfilePictureUploadUrl: async ({ userId }: { userId: string }) => {
    const bucket = 'public-assets'
    const path = `profile_pictures/${userId}`
    const signedUrl = await storageService.getSignedUploadUrl(
      bucket,
      path,
      'image/*',
    )
    return signedUrl
  },
  deleteProfilePicture: async ({ userId }: { userId: string }) => {
    await storageService.deleteUserProfilePicture({ userId })
    await usersService.updateUserProfile({
      userId,
      data: { profile_pictures_url: null },
    })
    return { success: true }
  },

  /** Fully delete a user from the system */
  fullDeleteUser: async ({ userId }: { userId: string }) => {
    const supabase = createServiceClient()
    await storageService.deleteUserProfilePicture({ userId })
    const { data, error } = await supabase.auth.admin.deleteUser(userId)
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  /** Get all user profiles */
  getAllProfiles: async () => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('first_name', { ascending: true })
    if (error) {
      throw new Error(error.message)
    }
    return data
  },
}
