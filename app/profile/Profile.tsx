'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckIcon,
  ExternalLinkIcon,
  InfoIcon,
  LinkIcon,
  XIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

import { profileIsIncomplete } from '@/lib/profiles'
import {
  ProfileFormData,
  initialProfileFormData,
  profileFormSchema,
} from '@/lib/schemas/profile'
import { downscaleAndUploadImage, toExternalLink } from '@/lib/utils'

import { URLS } from '@/utils/urls'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { getCurrentUserProfilePictureUploadUrl } from '@/app/actions/db/storage'
import {
  deleteCurrentUserProfilePicture,
  getCurrentUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from '@/app/actions/db/users'
import { ProfileInfoModal } from '@/app/profile/ProfileInfoModal'
import { useProfileUpdate } from '@/app/profile/hooks/useProfileUpdate'

export default function Profile() {
  const queryClient = useQueryClient()
  const [temporarilyDismissedInfoRequest, setTemporarilyDismissedInfoRequest] =
    useState(false)
  const { data: currentUser, isLoading: currentUserLoading } = useQuery({
    queryKey: ['users', 'current'],
    queryFn: getCurrentUser,
  })

  const { data: currentUserProfile } = useQuery({
    queryKey: ['users', 'profile', currentUser?.id],
    queryFn: () => getCurrentUserProfile(),
    enabled: !!currentUser?.id,
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const showCTAModal = useMemo(() => {
    console.log('showCTAModal', currentUserProfile)
    console.log(
      'temporarilyDismissedInfoRequest',
      temporarilyDismissedInfoRequest,
    )
    if (
      !currentUserProfile ||
      currentUserProfile.dismissed_info_request ||
      temporarilyDismissedInfoRequest
    )
      return false
    return profileIsIncomplete(currentUserProfile)
  }, [currentUserProfile, temporarilyDismissedInfoRequest])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state using shared schema
  const [formData, setFormData] = useState<ProfileFormData>(
    initialProfileFormData,
  )

  // Update form data when profile loads
  useEffect(() => {
    if (currentUserProfile && !isEditMode) {
      setFormData(currentUserProfile)
    }
  }, [currentUserProfile, isEditMode])

  // Use shared profile update hook
  const { updateProfile, isUpdatingProfile } = useProfileUpdate({
    currentUserId: currentUser?.id,
    onSuccess: () => {
      setIsEditMode(false)
      setTemporarilyDismissedInfoRequest(true)
    },
  })

  // Profile picture upload mutation
  const uploadPictureMutation = useMutation({
    mutationFn: async (file: File) => {
      // Get signed URL from server
      if (!currentUser?.id) {
        throw new Error('User not found')
      }

      const { signedUrl, storageUrl } =
        await getCurrentUserProfilePictureUploadUrl({})

      // Upload file directly to storage using signed URL
      await downscaleAndUploadImage(signedUrl, file)

      // Update profile with new picture URL directly without triggering the profile update mutation
      await updateCurrentUserProfile({
        data: {
          profile_pictures_url: storageUrl + '?v=' + Date.now(),
        },
      })
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'profile', currentUser?.id],
      })
      toast.success('Profile picture updated successfully!')
    },
    onError: (error) => {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload profile picture')
    },
  })

  // Profile picture delete mutation
  const deletePictureMutation = useMutation({
    mutationFn: async () => {
      await deleteCurrentUserProfilePicture()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'profile', currentUser?.id],
      })
      toast.success('Profile picture removed successfully!')
    },
    onError: (error) => {
      console.error('Error removing image:', error)
      toast.error('Failed to remove profile picture')
    },
  })

  if (currentUserLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-8 h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="flex items-start space-x-6">
            <div className="h-32 w-32 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-4">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="h-4 w-2/3 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    updateProfile(formData)
  }

  const handleCancel = () => {
    setFormData(profileFormSchema.parse(currentUserProfile))
    setIsEditMode(false)
  }

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    uploadPictureMutation.mutate(file)
  }

  const handleRemoveImage = async () => {
    deletePictureMutation.mutate()
  }

  const fullName =
    `${currentUserProfile?.first_name || ''} ${currentUserProfile?.last_name || ''}`.trim() ||
    'No name set'
  const isSaving =
    isUpdatingProfile ||
    uploadPictureMutation.isPending ||
    deletePictureMutation.isPending
  console.log('showCTAModal', showCTAModal)
  return (
    <>
      {showCTAModal && (
        <ProfileInfoModal
          onClose={() => setTemporarilyDismissedInfoRequest(true)}
          currentProfile={currentUserProfile}
          currentUserId={currentUser?.id}
        />
      )}

      <div className="container mx-auto flex max-w-md flex-col items-center px-4 py-8 md:max-w-4xl">
        <div className="mb-8 flex w-full items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          {!isEditMode ? (
            <Button onClick={() => setIsEditMode(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        <div className="w-full rounded-lg border border-border-primary bg-card p-6">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {currentUserProfile?.profile_pictures_url ? (
                  <Image
                    src={currentUserProfile.profile_pictures_url}
                    alt="Profile picture"
                    width={128}
                    height={128}
                    className="aspect-square rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted">
                    <span className="text-2xl text-muted-foreground">
                      {currentUserProfile?.first_name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        currentUser?.email?.charAt(0)?.toUpperCase() ||
                        '?'}
                    </span>
                  </div>
                )}
              </div>

              {isEditMode && (
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSaving}
                  >
                    Upload Photo
                  </Button>
                  {currentUserProfile?.profile_pictures_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={isSaving}
                    >
                      Remove Photo
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Profile Information Section */}
            <div className="flex-1 space-y-6">
              {/* Full Name */}
              <div>
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                {isEditMode ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="First name"
                      value={formData.first_name ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          first_name: e.target.value || null,
                        }))
                      }
                    />
                    <Input
                      placeholder="Last name"
                      value={formData.last_name ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          last_name: e.target.value || null,
                        }))
                      }
                    />
                  </div>
                ) : (
                  <p className="text-lg">{fullName}</p>
                )}
              </div>
              {/* Bio */}
              <div>
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                {isEditMode ? (
                  <Textarea
                    placeholder="Bio"
                    value={formData.bio ?? ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bio: e.target.value || null,
                      }))
                    }
                  />
                ) : (
                  <p className="text-lg">
                    {currentUserProfile?.bio || 'Not set'}
                  </p>
                )}
              </div>
              {/* Discord Handle */}
              <div>
                <label className="label">
                  <span className="label-text">Discord Handle</span>
                </label>
                {isEditMode ? (
                  <Input
                    placeholder="Your Discord handle"
                    value={formData.discord_handle ?? ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discord_handle: e.target.value || null,
                      }))
                    }
                  />
                ) : (
                  <p className="text-lg">
                    {currentUserProfile?.discord_handle || 'Not set'}
                  </p>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="label">
                  <span className="label-text">Website</span>
                </label>
                {isEditMode ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Website name"
                      value={formData.site_name ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          site_name: e.target.value || null,
                        }))
                      }
                    />
                    <Input
                      placeholder="Website URL"
                      value={formData.site_url ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          site_url: e.target.value || null,
                        }))
                      }
                    />
                  </div>
                ) : (
                  <div>
                    {currentUserProfile?.site_name &&
                    currentUserProfile?.site_url ? (
                      <a
                        href={toExternalLink(currentUserProfile.site_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:underline"
                      >
                        <LinkIcon className="h-4 w-4" />
                        {currentUserProfile.site_name}
                        <span className="text-gray-400">
                          {currentUserProfile.site_url}
                        </span>
                      </a>
                    ) : (
                      <p className="text-lg">Not set</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <p className="text-lg">
                  {currentUserProfile?.email || currentUser.email}
                </p>
                {isEditMode && (
                  <Link href="/profile/change-email">
                    <div
                      className={buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                      })}
                    >
                      Change Email
                    </div>
                  </Link>
                )}
              </div>
              <div className={`flex gap-4 ${isEditMode ? 'flex-col' : ''}`}>
                {/* Homepage Display Radio Group */}
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <label className="block text-sm font-medium">
                      Show on Homepage?
                    </label>
                    <Tooltip clickable>
                      <TooltipTrigger>
                        <InfoIcon className="size-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Whether your profile card is displayed on the homepage
                        attendee list. Opt-in.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  {isEditMode ? (
                    <RadioGroup
                      value={
                        formData.opted_in_to_homepage_display === null
                          ? ''
                          : formData.opted_in_to_homepage_display
                            ? 'yes'
                            : 'no'
                      }
                      onValueChange={(value) => {
                        const newValue =
                          value === 'yes' ? true : value === 'no' ? false : null
                        setFormData((prev) => ({
                          ...prev,
                          opted_in_to_homepage_display: newValue,
                        }))
                      }}
                      className="flex"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="homepage-yes" />
                        <label htmlFor="homepage-yes" className="text-sm">
                          Yes
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="homepage-no" />
                        <label htmlFor="homepage-no" className="text-sm">
                          No
                        </label>
                      </div>
                    </RadioGroup>
                  ) : (
                    <p className="text-lg">
                      {currentUserProfile?.opted_in_to_homepage_display ===
                      null ? (
                        'Default opted out'
                      ) : currentUserProfile?.opted_in_to_homepage_display ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <XIcon className="h-4 w-4 text-red-500" />
                      )}
                    </p>
                  )}
                </div>
                {/* Age Status Radio Group */}
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium">18+?</label>
                  {isEditMode ? (
                    <RadioGroup
                      value={
                        formData.minor === null
                          ? ''
                          : formData.minor
                            ? 'no'
                            : 'yes'
                      }
                      onValueChange={(value) => {
                        const newValue =
                          value === 'yes' ? false : value === 'no' ? true : null
                        setFormData((prev) => ({ ...prev, minor: newValue }))
                      }}
                      className="flex"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="age-yes" />
                        <label htmlFor="age-yes" className="text-sm">
                          Yes
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="age-no" />
                        <label htmlFor="age-no" className="text-sm">
                          No
                        </label>
                      </div>
                    </RadioGroup>
                  ) : (
                    <p className="text-lg">
                      {currentUserProfile?.minor ? (
                        <XIcon className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      )}
                    </p>
                  )}
                </div>
                {/* Bringing Kids Radio Group */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium">
                      Bringing Kids?
                    </label>
                    {isEditMode ? (
                      <RadioGroup
                        value={
                          formData.bringing_kids === null
                            ? 'null'
                            : formData.bringing_kids
                              ? 'yes'
                              : 'no'
                        }
                        onValueChange={(value) => {
                          const newValue =
                            value === 'yes'
                              ? true
                              : value === 'no'
                                ? false
                                : null
                          setFormData((prev) => ({
                            ...prev,
                            bringing_kids: newValue,
                          }))
                        }}
                        className="flex"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="kids-yes" />
                          <label htmlFor="kids-yes" className="text-sm">
                            Yes
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="kids-no" />
                          <label htmlFor="kids-no" className="text-sm">
                            No
                          </label>
                        </div>
                      </RadioGroup>
                    ) : (
                      <p className="text-lg">
                        {currentUserProfile?.bringing_kids ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XIcon className="h-4 w-4 text-red-500" />
                        )}
                      </p>
                    )}
                  </div>
                  {formData.bringing_kids && (
                    <Link
                      className={`w-fit ${buttonVariants({ variant: 'default', size: 'sm' })}`}
                      href={URLS.CHILDREN_REGISTRATION}
                      target="_blank"
                    >
                      If you haven&apos;t, please fill out the children
                      registration form
                      <ExternalLinkIcon className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
              {isEditMode && (
                <div className="flex flex-col gap-2">
                  <Link href="/profile/reset-password">
                    <Button variant="outline" size="sm">
                      Reset Password
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
