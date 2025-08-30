'use client'

import { useRef, useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { CheckIcon, MinusIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

import { profileIsIncomplete } from '@/lib/profiles'
import {
  ProfileFormData,
  initialProfileFormData,
  profileFormSchema,
} from '@/lib/schemas/profile'
import { downscaleAndUploadImage, toExternalLink } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

import { adminGetUserProfilePictureUploadUrl } from '@/app/actions/db/storage'
import {
  adminDeleteUserProfilePicture,
  adminUpdateUserProfile,
} from '@/app/actions/db/users'

import { DbProfile, DbTicket } from '@/types/database/dbTypeAliases'

type Props = {
  profile: DbProfile
  tickets: DbTicket[]
}

export default function AdminProfileEditor({ profile, tickets }: Props) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [current, setCurrent] = useState<DbProfile>(profile)
  const [formData, setFormData] = useState<ProfileFormData>(() => {
    try {
      return profileFormSchema.parse(profile)
    } catch {
      return initialProfileFormData
    }
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateMutation = useMutation({
    mutationFn: async () => {
      const parsed = profileFormSchema.safeParse(formData)
      if (!parsed.success) {
        toast.error(
          <div>
            <p>Error saving profile:</p>
            <ul className="ml-4 list-disc">
              {parsed.error.issues.map((issue, i) => (
                <li key={i}>
                  {issue.path.join('.')}: {issue.message}
                </li>
              ))}
            </ul>
          </div>,
        )
        throw new Error('Validation failed')
      }
      await adminUpdateUserProfile({ userId: current.id, data: parsed.data })
      return parsed.data
    },
    onSuccess: (data) => {
      setCurrent((prev) => ({ ...prev, ...data }))
      setIsEditMode(false)
      toast.success('Profile updated successfully!')
    },
    onError: (err) => {
      console.error(err)
      toast.error('Failed to update profile')
    },
  })

  const uploadPictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const { signedUrl, storageUrl } =
        await adminGetUserProfilePictureUploadUrl({ userId: current.id })
      await downscaleAndUploadImage(signedUrl, file)
      const newUrl = storageUrl + '?v=' + Date.now()
      await adminUpdateUserProfile({
        userId: current.id,
        data: { profile_pictures_url: newUrl },
      })
      return newUrl
    },
    onSuccess: (newUrl) => {
      setCurrent((prev) => ({ ...prev, profile_pictures_url: newUrl }))
      toast.success('Profile picture updated successfully!')
    },
    onError: (error) => {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload profile picture')
    },
  })

  const deletePictureMutation = useMutation({
    mutationFn: async () => {
      await adminDeleteUserProfilePicture({ userId: current.id })
    },
    onSuccess: () => {
      setCurrent((prev) => ({ ...prev, profile_pictures_url: null }))
      toast.success('Profile picture removed successfully!')
    },
    onError: (error) => {
      console.error('Error removing image:', error)
      toast.error('Failed to remove profile picture')
    },
  })

  const isSaving =
    updateMutation.isPending ||
    uploadPictureMutation.isPending ||
    deletePictureMutation.isPending

  const fullName =
    `${current.first_name || ''} ${current.last_name || ''}`.trim() ||
    'No name set'

  const onSave = () => updateMutation.mutate()
  const onCancel = () => {
    try {
      setFormData(profileFormSchema.parse(current))
    } catch {
      setFormData(initialProfileFormData)
    }
    setIsEditMode(false)
  }

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadPictureMutation.mutate(file)
  }

  const renderTrueFalseNull = (value: boolean | null) => {
    switch (value) {
      case null:
        return <MinusIcon className="text-gray-500" size={16} />
      case true:
        return <CheckIcon className="text-green-500" size={16} />
      case false:
        return <XIcon className="text-red-500" size={16} />
      default:
        return <MinusIcon className="text-gray-500" size={16} />
    }
  }

  return (
    <div className="w-full rounded-lg border border-border-primary bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Profile Details</h3>
          <div className="flex gap-2">
            {current.is_admin && (
              <span className="rounded-md bg-red-100 px-2 py-1 text-xs text-red-800">
                Admin
              </span>
            )}
            {current.minor && (
              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-800">
                Minor
              </span>
            )}
            {current.bringing_kids && (
              <span className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800">
                Bringing Kids
              </span>
            )}
          </div>
        </div>
        {!isEditMode ? (
          <Button onClick={() => setIsEditMode(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-8 md:flex-row">
        {/* Picture */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {current.profile_pictures_url ? (
              <Image
                src={current.profile_pictures_url}
                alt="Profile picture"
                width={128}
                height={128}
                className="aspect-square rounded-full object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted">
                <span className="text-2xl text-muted-foreground">
                  {current.first_name?.charAt(0)?.toUpperCase() ||
                    current.email?.charAt(0)?.toUpperCase() ||
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
                onChange={onUpload}
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
              {current.profile_pictures_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deletePictureMutation.mutate()}
                  disabled={isSaving}
                >
                  Remove Photo
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Form/info */}
        <div className="flex-1 space-y-6">
          {/* Name */}
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
          {/* Bio under Name */}
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
              <p className="text-lg">{current.bio || 'Not set'}</p>
            )}
          </div>
          {/* Email (read-only), Tickets, ID */}
          <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2">
            <div>
              <strong>Email:</strong>
              <p className="mt-1">{current.email || 'Not provided'}</p>
            </div>
            <div>
              <strong>Tickets:</strong>
              <p className="mt-1">{tickets.length}</p>
            </div>
            <div className="md:col-span-2">
              <strong>ID:</strong>
              <p className="mt-1 font-mono text-sm break-all">{current.id}</p>
            </div>
          </div>

          {/* Discord */}
          <div>
            <label className="label">
              <span className="label-text">Discord Handle</span>
            </label>
            {isEditMode ? (
              <Input
                placeholder="Discord handle"
                value={formData.discord_handle ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discord_handle: e.target.value || null,
                  }))
                }
              />
            ) : (
              <p className="text-lg">{current.discord_handle || 'Not set'}</p>
            )}
          </div>

          {/* Websites side-by-side */}
          <div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Website 1 */}
              <div>
                <label className="label">
                  <span className="label-text">Website 1</span>
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
                    {current.site_name && current.site_url ? (
                      <a
                        href={toExternalLink(current.site_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:underline"
                      >
                        {current.site_name}
                        <span className="text-gray-400">
                          {current.site_url}
                        </span>
                      </a>
                    ) : (
                      <p className="text-lg">Not set</p>
                    )}
                  </div>
                )}
              </div>
              {/* Website 2 */}
              {(isEditMode || current.site_name_2 || current.site_url_2) && (
                <div>
                  <label className="label">
                    <span className="label-text">Website 2</span>
                  </label>
                  {isEditMode ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Website name"
                        value={formData.site_name_2 ?? ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            site_name_2: e.target.value || null,
                          }))
                        }
                      />
                      <Input
                        placeholder="Website URL"
                        value={formData.site_url_2 ?? ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            site_url_2: e.target.value || null,
                          }))
                        }
                      />
                    </div>
                  ) : (
                    <div>
                      {current.site_name_2 || current.site_url_2 ? (
                        <a
                          href={current.site_url_2 || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:underline"
                        >
                          {current.site_name_2 || 'Unnamed'}
                          {current.site_url_2 && (
                            <span className="text-gray-400">
                              {current.site_url_2}
                            </span>
                          )}
                        </a>
                      ) : (
                        <p className="text-lg">Not set</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Visibility + Age + Kids */}
          <div className={`flex gap-4 ${isEditMode ? 'flex-col' : ''}`}>
            {/* Homepage Display */}
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium">
                Show on Homepage?
              </label>
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
                renderTrueFalseNull(current.opted_in_to_homepage_display)
              )}
            </div>

            {/* 18+? maps to minor field */}
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium">18+?</label>
              {isEditMode ? (
                <RadioGroup
                  value={
                    formData.minor === null ? '' : formData.minor ? 'no' : 'yes'
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
                renderTrueFalseNull(current.minor)
              )}
            </div>

            {/* Bringing kids */}
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium">
                Bringing Kids?
              </label>
              {isEditMode ? (
                <RadioGroup
                  value={
                    formData.bringing_kids === null
                      ? ''
                      : formData.bringing_kids
                        ? 'yes'
                        : 'no'
                  }
                  onValueChange={(value) => {
                    const newValue =
                      value === 'yes' ? true : value === 'no' ? false : null
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
                renderTrueFalseNull(current.bringing_kids)
              )}
            </div>
            {/* Profile complete + Modal dismissed inline */}
            <div className="flex items-center gap-2">
              <span className="text-xs">Profile:</span>
              {renderTrueFalseNull(!profileIsIncomplete(current))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">Modal:</span>
              {renderTrueFalseNull(!!current.dismissed_info_request)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
