import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toExternalLink(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('/#')) {
    return url
  }
  return `https://${url}`
}

export async function uploadFileWithSignedUrl(
  signedUrl: string,
  file: File,
): Promise<void> {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }
}

export async function downscaleAndUploadImage(
  signedUrl: string,
  file: File,
  maxWidth: number = 512,
): Promise<void> {
  // Check if the file is an image
  if (!file.type.startsWith('image/')) {
    // If not an image, upload as-is
    return uploadFileWithSignedUrl(signedUrl, file)
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions preserving aspect ratio
      const { width, height } = img
      let newWidth = width
      let newHeight = height

      if (width > maxWidth) {
        newWidth = maxWidth
        newHeight = (height * maxWidth) / width
      }

      // Set canvas dimensions
      canvas.width = newWidth
      canvas.height = newHeight

      // Draw the resized image
      ctx?.drawImage(img, 0, 0, newWidth, newHeight)

      // Convert to WebP blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create image blob'))
            return
          }

          // Create a new File object with WebP type
          const webpFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, '.webp'),
            {
              type: 'image/webp',
            },
          )

          // Upload the WebP file
          uploadFileWithSignedUrl(signedUrl, webpFile)
            .then(resolve)
            .catch(reject)
        },
        'image/webp',
        0.85, // Quality setting (0.85 = 85% quality)
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image for processing'))
    }

    // Load the image from the file
    img.src = URL.createObjectURL(file)
  })
}

export function canonicalUserProfilePictureUrl({
  userId,
}: {
  userId: string
}): string {
  const bucket = 'public-assets'
  const path = `profile_pictures/${userId}`
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set')
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}
