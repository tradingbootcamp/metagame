import { createServiceClient } from '@/utils/supabase/service'

export const storageService = {
  /** Get a signed URL for uploading a file */
  getSignedUploadUrl: async (
    bucket: string,
    path: string,
    fileType: string,
  ) => {
    console.log('getSignedUploadUrl', bucket, path, fileType)
    const supabase = createServiceClient()
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path, { upsert: true })

    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  /** Delete a file from storage */
  deleteFile: async (bucket: string, path: string) => {
    const supabase = createServiceClient()
    const { data, error } = await supabase.storage.from(bucket).remove([path])
    if (error) {
      throw new Error(error.message)
    }
    return data
  },

  /** Get the public URL for a file */
  getFileUrl: async (bucket: string, path: string) => {
    const supabase = createServiceClient()
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },
  getUserProfilePictureUploadUrl: async ({
    userId,
    fileExtension,
  }: {
    userId: string
    fileExtension?: string
  }) => {
    const bucket = 'public-assets'
    const extension = fileExtension ? `.${fileExtension}` : ''
    const path = `profile_pictures/${userId}${extension}`
    const url = await storageService.getSignedUploadUrl(bucket, path, 'image/*')
    return {
      signedUrl: url.signedUrl,
      storageUrl:
        process.env.NEXT_PUBLIC_SUPABASE_URL +
        '/storage/v1/object/public/' +
        bucket +
        '/' +
        path,
    }
  },
  /** Delete a user's profile picture */
  deleteUserProfilePicture: async ({ userId }: { userId: string }) => {
    const bucket = 'public-assets'
    const path = `profile_pictures/${userId}`
    await storageService.deleteFile(bucket, path)
  },
}
