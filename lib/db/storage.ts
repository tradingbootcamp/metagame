import { createServiceClient } from '@/utils/supabase/service'

const ALLOWED_UPLOAD_CONTENT_TYPES = [
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
]

export const storageService = {
  /** Get a signed URL for uploading a file.
   *
   * fileType gates whether a URL is issued at all. It can't constrain the
   * Content-Type the client eventually PUTs — supabase-js signed upload URLs
   * only carry the path and the upsert flag — so the bucket's
   * allowed_mime_types is the only real write-time enforcement. Keep the set
   * of signable paths fixed rather than trusting either. */
  getSignedUploadUrl: async (
    bucket: string,
    path: string,
    fileType: string,
  ) => {
    if (!ALLOWED_UPLOAD_CONTENT_TYPES.includes(fileType)) {
      throw new Error(`Unsupported upload content type: ${fileType}`)
    }
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
  getUserProfilePictureUploadUrl: async ({ userId }: { userId: string }) => {
    const bucket = 'public-assets'
    // Fixed, extensionless key: the caller gets no say in what it can write to,
    // and canonicalUserProfilePictureUrl() in lib/utils reconstructs this path.
    const path = `profile_pictures/${userId}`
    const url = await storageService.getSignedUploadUrl(
      bucket,
      path,
      'image/webp',
    )
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
