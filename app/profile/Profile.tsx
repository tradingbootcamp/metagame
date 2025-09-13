'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { FaEdit } from 'react-icons/fa'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckIcon, ExternalLinkIcon, InfoIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

import { profileIsIncomplete } from '@/lib/profiles'
import {
  ProfileFormData,
  initialProfileFormData,
  profileFormSchema,
} from '@/lib/schemas/profile'
import { downscaleAndUploadImage } from '@/lib/utils'

import { URLS } from '@/utils/urls'

import PlayerCard from '@/components/PlayerCard'
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
  updateCurrentUserProfile,
} from '@/app/actions/db/users'
import { ProfileInfoModal } from '@/app/profile/ProfileInfoModal'
import { useProfileUpdate } from '@/app/profile/hooks/useProfileUpdate'

import { useUser } from '@/hooks/useUser'

export default function Profile() {
  const queryClient = useQueryClient()
  const [temporarilyDismissedInfoRequest, setTemporarilyDismissedInfoRequest] =
    useState(false)
  const { currentUser, currentUserProfile, currentUserLoading } = useUser()
  const [isEditMode, setIsEditMode] = useState(false)
  const showCTAModal = useMemo(() => {
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
      setFormData(profileFormSchema.parse(currentUserProfile))
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
      // Invalidate both private and public profile caches
      queryClient.invalidateQueries({
        queryKey: ['users', 'profile', currentUser?.id],
        exact: false,
      })
      // Also explicitly invalidate the public profile used by PlayerCard
      queryClient.invalidateQueries({
        queryKey: ['users', 'profile', currentUser?.id, 'public'],
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
      // Invalidate both private and public profile caches
      queryClient.invalidateQueries({
        queryKey: ['users', 'profile', currentUser?.id],
        exact: false,
      })
      // Also explicitly invalidate the public profile used by PlayerCard
      queryClient.invalidateQueries({
        queryKey: ['users', 'profile', currentUser?.id, 'public'],
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

  const isSaving =
    isUpdatingProfile ||
    uploadPictureMutation.isPending ||
    deletePictureMutation.isPending
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
        <div className="mb-2 flex w-full justify-center">
          <div className="mb-4 flex items-center gap-2">
            {!isEditMode && (
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">Profile</h1>
                <button
                  className="flex cursor-pointer items-center justify-center rounded-md p-2"
                  onClick={() => setIsEditMode(true)}
                >
                  <FaEdit className="size-4" />
                </button>
              </div>
            )}
          </div>

          {isEditMode && (
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

        {/* Profile content */}
        {!isEditMode ? (
          <div className="flex flex-col items-center gap-8">
            {/* Player Card */}
            <div className="flex-shrink-0">
              {currentUser?.id && (
                <PlayerCard
                  userId={currentUser.id}
                  asCelestialCard={true}
                  tiltFactor={2.5}
                  gleamFollowsTilt
                  showStatBoxes
                  width={350}
                />
              )}
            </div>
            {/* Off-card details */}
            <div className="mx-auto flex w-full max-w-xl flex-col items-center space-y-6 text-center">
              {/* Email */}
              <div className="flex flex-col items-center">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <p className="text-lg">
                  {currentUserProfile?.email || currentUser.email}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-6">
                {/* Homepage display */}
                <div className="flex items-center justify-center gap-2">
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
                </div>

                {/* Over 18? */}
                <div className="flex items-center justify-center gap-2">
                  <label className="block text-sm font-medium">Over 18?</label>
                  <p className="text-lg">
                    {currentUserProfile?.minor === null ? (
                      '—'
                    ) : currentUserProfile?.minor ? (
                      <XIcon className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    )}
                  </p>
                </div>

                {/* Bringing kids */}
                <div className="flex items-center justify-center gap-2">
                  <label className="block text-sm font-medium">
                    Bringing Kids?
                  </label>
                  <p className="text-lg">
                    {currentUserProfile?.bringing_kids ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <XIcon className="h-4 w-4 text-red-500" />
                    )}
                  </p>
                </div>
              </div>

              {currentUserProfile?.bringing_kids && (
                <Link
                  className={`mx-auto w-fit ${buttonVariants({ variant: 'default', size: 'sm' })}`}
                  href={URLS.CHILDREN_REGISTRATION}
                  target="_blank"
                >
                  If you haven&apos;t, please fill out the children registration
                  form
                  <ExternalLinkIcon className="h-4 w-4" />
                </Link>
              )}
            </div>
            <span>Homepage Display View</span>
            <PlayerCard
              userId={currentUser.id}
              asCelestialCard={true}
              tiltFactor={2.5}
              gleamFollowsTilt
              width={150}
              showStatBoxes={false}
            />
          </div>
        ) : (
          <div className="w-full rounded-lg border border-border-primary bg-card p-6">
            <div className="flex flex-col items-center gap-8 md:flex-row">
              {/* Profile Picture Section (edit) */}
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
              </div>

              {/* Profile Information Section (edit) */}
              <div className="flex-1 space-y-6">
                {/* Full Name */}
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                  <div>
                    <label className="label">
                      <span className="label-text">Name</span>
                    </label>
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
                  </div>
                  {/* Pronouns */}
                  <div>
                    <label className="label">
                      <span className="label-text">Pronouns</span>
                    </label>
                    <Input
                      placeholder=""
                      className="w-16"
                      value={formData.pronouns ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pronouns: e.target.value || null,
                        }))
                      }
                    />
                  </div>
                </div>
                {/* Bio */}
                <div>
                  <label className="label">
                    <span className="label-text">Bio</span>
                  </label>
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
                </div>
                {/* Discord Handle */}
                <div>
                  <label className="label">
                    <span className="label-text">Discord Handle</span>
                  </label>
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
                </div>

                {/* Website */}
                <div>
                  <label className="label">
                    <span className="label-text">Website</span>
                  </label>
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
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <p className="text-lg">
                    {currentUserProfile?.email || currentUser.email}
                  </p>
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
                </div>

                <div className="flex flex-col gap-4">
                  {/* Homepage Display */}
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
                  </div>

                  {/* Age Status */}
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium">18+?</label>
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
                  </div>

                  {/* Bringing Kids */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium">
                        Bringing Kids?
                      </label>
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

                <div className="flex flex-col gap-2">
                  <Link href="/profile/reset-password">
                    <Button variant="outline" size="sm">
                      Reset Password
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
